import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertExerciseSectionSchema,
  insertWorkoutSchema,
  insertHabitSchema,
  insertHabitCompletionSchema,
  insertUserSchema
} from "@shared/schema";
import { startOfDay, subDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { z } from "zod";
import multer from "multer";
import FormData from "form-data";
import axios from "axios";
import fs from "fs";
import path from "path";
import { registerAIRoutes } from "./ai-routes";
import { authenticateToken, comparePassword, generateAccessToken, generateRefreshToken, hashPassword, verifyRefreshToken } from "./auth";

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
});

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Extend Request type to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  registerAIRoutes(app);

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("Received registration request:", req.body);
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(userData.password);
      const user = await storage.createUser({ ...userData, password: hashedPassword });

      // Migrate orphaned data to this first user (or any new user, based on logic)
      // await storage.migrateOrphanedData(user.id);

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ user: { id: user.id, username: user.username } });
    } catch (err: any) {
      console.error("Registration Error:", err);
      if (err instanceof z.ZodError) {
        res.status(400).json(err.errors);
      } else {
        res.status(500).json({ message: "Internal Server Error", details: err.message });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ user: { id: user.id, username: user.username } });
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post("/api/auth/refresh", (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const user = verifyRefreshToken(refreshToken);
    if (!user) return res.sendStatus(403);

    const accessToken = generateAccessToken(user);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({ success: true });
  });

  app.get("/api/auth/me", authenticateToken, (req: AuthRequest, res) => {
    res.json(req.user);
  });

  app.post("/api/auth/logout", (_req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.sendStatus(200);
  });

  // --- Voice Log (Protected) ---
  app.post("/api/voice-log", authenticateToken, upload.single("audio"), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded" });
      }

      console.log("Received audio file:", req.file.path);

      // 1. Send to ElevenLabs STT
      const formData = new FormData();
      formData.append("file", fs.createReadStream(req.file.path));
      formData.append("model_id", "scribe_v1");

      console.log("Sending to ElevenLabs...");
      const sttResponse = await axios.post(
        "https://api.elevenlabs.io/v1/speech-to-text",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            "xi-api-key": process.env.ELEVENLABS_API_KEY,
          },
        }
      );

      const transcribedText = sttResponse.data.text;
      console.log("Transcribed Text:", transcribedText);

      // 2. Send to Gemini for parsing
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

      const prompt = `
        Extract workout data from the following text: "${transcribedText}"
        
        Return a JSON object with the following structure:
        {
          "workouts": [
            {
              "exerciseName": "Exercise Name",
              "sets": number,
              "reps": number,
              "weight": number (optional, 0 if not specified),
              "unit": string (optional, "lbs" or "kgs", default "lbs"),
              "rpe": number (optional, 0 if not specified)
            }
          ]
        }
        If multiple exercises are mentioned, include them all in the array.
        Standardize exercise names where possible (e.g., "bench" -> "Bench Press").
        Return ONLY valid JSON.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(jsonStr);

      // 3. Save to Database
      const savedWorkouts = [];
      const requestedSectionId = req.body.sectionId;
      const userId = req.user!.id;

      for (const w of parsedData.workouts) {
        let sectionId = requestedSectionId;

        // If no sectionId provided (fallback), find or create a default one
        if (!sectionId) {
          let sections = await storage.getAllSections(userId);
          sectionId = sections[0]?.id;

          if (!sectionId) {
            const newSection = await storage.createSection({
              name: "Voice Logged",
              targetSets: 10,
              date: new Date().toISOString(),
              userId
            });
            sectionId = newSection.id;
          }
        }

        const workoutData = {
          sectionId: sectionId,
          exerciseType: w.exerciseName,
          sets: w.sets,
          reps: w.reps,
          weight: Number(w.weight) || 0,
          unit: w.unit || "lbs",
          date: req.body.date || new Date().toISOString(),
          userId
        };

        const saved = await storage.createWorkout(workoutData);
        savedWorkouts.push(saved);
      }

      // Cleanup uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        transcription: transcribedText,
        workouts: savedWorkouts
      });

    } catch (error: any) {
      console.error("Voice Log Error:", error.response?.data || error.message);
      res.status(500).json({ error: error.message || "Failed to process voice log" });
    }
  });

  // --- Exercise Sections (Protected) ---
  app.get("/api/sections", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { startDate, endDate } = req.query;
      let sections;
      if (startDate && endDate) {
        sections = await storage.getSectionsByWeek(startDate as string, endDate as string, req.user!.id);
      } else {
        sections = await storage.getAllSections(req.user!.id);
      }
      res.json(sections);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sections/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const section = await storage.getSectionById(req.params.id);
      if (!section) {
        res.status(404).json({ message: "Section not found" });
        return;
      }
      if (section.userId && section.userId !== req.user!.id) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      res.json(section);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/sections", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const data = insertExerciseSectionSchema.parse(req.body);
      const section = await storage.createSection({ ...data, userId: req.user!.id });
      res.json(section);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/sections/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const section = await storage.getSectionById(req.params.id);
      if (!section) {
        res.status(404).json({ message: "Section not found" });
        return;
      }
      if (section.userId && section.userId !== req.user!.id) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      await storage.deleteSection(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Workouts (Protected) ---
  app.get("/api/workouts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const workouts = await storage.getAllWorkouts(req.user!.id);
      res.json(workouts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workouts/section/:sectionId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const workouts = await storage.getWorkoutsBySection(req.params.sectionId);
      // Note: Should ideally check section ownership here too
      res.json(workouts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workouts/week", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { startDate, endDate } = req.query;
      const workouts = await storage.getWorkoutsByWeek(startDate as string, endDate as string, req.user!.id);
      res.json(workouts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workouts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const data = req.body;
      const workout = await storage.createWorkout({ ...data, userId: req.user!.id });
      res.json(workout);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/workouts/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      await storage.deleteWorkout(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Habits (Protected) ---
  app.get("/api/habits", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const habits = await storage.getAllHabits(req.user!.id);
      res.json(habits);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/habits", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const data = req.body;
      const habit = await storage.createHabit({ ...data, userId: req.user!.id });
      res.json(habit);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/habits/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const habit = await storage.getHabitById(req.params.id);
      if (!habit) {
        res.status(404).json({ message: "Habit not found" });
        return;
      }
      if (habit.userId && habit.userId !== req.user!.id) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      await storage.deleteHabit(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Habit Completions (Protected) ---
  app.get("/api/habits/:habitId/completions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const completions = await storage.getHabitCompletions(req.params.habitId);
      res.json(completions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/completions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const completions = await storage.getAllCompletions(req.user!.id);
      res.json(completions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/completions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const data = req.body;
      const completion = await storage.createCompletion({ ...data, userId: req.user!.id });
      res.json(completion);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/completions/:habitId/:date", authenticateToken, async (req: AuthRequest, res) => {
    try {
      await storage.deleteCompletion(req.params.habitId, req.params.date);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Analytics (Protected) ---
  app.get("/api/analytics/dashboard", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const sections = await storage.getAllSections(userId);
      const workouts = await storage.getAllWorkouts(userId);
      const completions = await storage.getAllCompletions(userId);

      // Calculate weekly progress
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

      const thisWeekWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.date);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      });

      const totalCompletedSets = thisWeekWorkouts.reduce((sum, w) => sum + w.sets, 0);
      const totalTargetSets = sections.reduce((sum, s) => sum + s.targetSets, 0);

      // Calculate section progress
      const sectionProgress = sections.map(section => {
        const sectionWorkouts = thisWeekWorkouts.filter(w => w.sectionId === section.id);
        const completedSets = sectionWorkouts.reduce((sum, w) => sum + w.sets, 0);
        const lastWorkout = workouts
          .filter(w => w.sectionId === section.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        return {
          sectionId: section.id,
          sectionName: section.name,
          completedSets,
          targetSets: section.targetSets,
          lastWorkout: lastWorkout?.date,
        };
      });

      // Calculate current streak (based on completions)
      const today = startOfDay(new Date());
      const sortedCompletions = completions
        .map(c => startOfDay(new Date(c.date)))
        .sort((a, b) => b.getTime() - a.getTime());

      let currentStreak = 0;
      const uniqueDates = Array.from(new Set(sortedCompletions.map(d => d.getTime())))
        .map(t => new Date(t));

      for (let i = 0; i < uniqueDates.length; i++) {
        const expectedDate = subDays(today, i);
        if (isSameDay(uniqueDates[i], expectedDate)) {
          currentStreak++;
        } else {
          break;
        }
      }

      res.json({
        currentStreak,
        totalCompletedSets,
        totalTargetSets,
        sectionProgress,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/progress", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const workouts = await storage.getAllWorkouts(req.user!.id);
      const { startDate, endDate } = req.query;

      let start = startDate ? new Date(startDate as string) : subDays(new Date(), 3 * 7); // Default to 3 weeks ago
      let end = endDate ? new Date(endDate as string) : new Date();

      // Adjust start and end to week boundaries
      start = startOfWeek(start, { weekStartsOn: 1 });
      end = endOfWeek(end, { weekStartsOn: 1 });

      // Calculate weekly volume data
      const weeks = [];
      let currentWeekStart = start;

      while (currentWeekStart <= end) {
        const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

        const weekWorkouts = workouts.filter(w => {
          const workoutDate = new Date(w.date);
          return workoutDate >= currentWeekStart && workoutDate <= currentWeekEnd;
        });

        const weekData: any = {
          week: `Week of ${currentWeekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
          total: weekWorkouts.reduce((sum, w) => sum + w.sets, 0),
        };

        // Add individual exercise breakdowns
        const exerciseTypes = new Set(weekWorkouts.map(w => w.exerciseType));
        exerciseTypes.forEach(exerciseType => {
          const exerciseSets = weekWorkouts
            .filter(w => w.exerciseType === exerciseType)
            .reduce((sum, w) => sum + w.sets, 0);
          weekData[exerciseType.toLowerCase().replace(/\s+/g, '_')] = exerciseSets;
        });

        weeks.push(weekData);

        // Move to next week
        currentWeekStart = new Date(currentWeekStart);
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }

      res.json({ volumeData: weeks });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
