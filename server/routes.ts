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

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
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
      console.log("Login attempt for user:", username);

      const user = await storage.getUserByUsername(username);
      console.log("User found:", user ? "yes" : "no");

      if (!user) {
        console.log("Login failed: User not found");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const passwordMatch = await comparePassword(password, user.password);
      console.log("Password match:", passwordMatch);

      if (!passwordMatch) {
        console.log("Login failed: Password mismatch");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      const isProduction = process.env.NODE_ENV === "production";
      console.log("Setting cookies, isProduction:", isProduction);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      console.log("Login successful for user:", username);
      res.json({ user: { id: user.id, username: user.username } });
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post("/api/auth/refresh", async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) return res.sendStatus(403);

    const user = await storage.getUserByUsername(payload.username);
    if (!user || user.id !== payload.id) return res.sendStatus(403);

    const newAccessToken = generateAccessToken(user);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({ message: "Token refreshed" });
  });

  app.get("/api/auth/me", authenticateToken, (req: AuthRequest, res) => {
    if (!req.user) return res.sendStatus(401);
    res.json({ id: req.user.id, username: req.user.username });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  });

  // --- Voice Log (Protected) ---
  app.post(
    "/api/voice-log",
    authenticateToken,
    upload.single("audio"),
    async (req: AuthRequest, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No audio file uploaded" });
        }

        console.log("Received audio file:", req.file.path);

        // 1️⃣ Read the audio file
        const audioBytes = fs.readFileSync(req.file.path);
        const base64Audio = audioBytes.toString("base64");

        // 2️⃣ Setup Gemini
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({
          model: "models/gemini-2.5-flash", // correct model
        });

        console.log("Sending audio to Gemini…");

        // 3️⃣ Gemini — transcription + structured JSON extraction
        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: req.file.mimetype,
              data: base64Audio,
            },
          },
          {
            text: `
You will receive workout voice logs.

Step 1 — TRANSCRIBE the audio.
Step 2 — Extract workout data from the transcription.

Return ONLY this JSON:
{
  "workouts": [
    {
      "exerciseName": "Exercise Name",
      "sets": number,
      "reps": number,
      "weight": number,
      "unit": "lbs" | "kgs",
      "rpe": number
    }
  ]
}

Rules:
- If weight not mentioned → 0
- If rpe not mentioned → 0
- Standardize names (e.g., "bench" → "Bench Press")
- NO explanation, ONLY valid JSON
          `,
          },
        ]);

        const responseText = result.response.text();
        console.log("Gemini Raw Output:", responseText);

        // 4️⃣ Clean JSON
        const jsonStr = responseText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        const parsedData = JSON.parse(jsonStr);

        // 5️⃣ Save to DB
        const savedWorkouts = [];
        const requestedSectionId = req.body.sectionId;
        const userId = req.user!.id;

        for (const w of parsedData.workouts) {
          let sectionId = requestedSectionId;

          if (!sectionId) {
            let sections = await storage.getAllSections(userId);
            sectionId = sections[0]?.id;

            if (!sectionId) {
              const newSection = await storage.createSection({
                name: "Voice Logged",
                targetSets: 10,
                date: new Date().toISOString(),
                userId,
              });
              sectionId = newSection.id;
            }
          }

          const workoutData = {
            sectionId,
            exerciseType: w.exerciseName,
            sets: w.sets,
            reps: w.reps,
            weight: Number(w.weight) || 0,
            unit: w.unit || "lbs",
            date: req.body.date || new Date().toISOString(),
            completed: true,
            userId,
          };

          const saved = await storage.createWorkout(workoutData);
          savedWorkouts.push(saved);
        }

        // 6️⃣ Delete uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
          transcription: "Transcription done by Gemini internally",
          workouts: savedWorkouts,
        });
      } catch (error: any) {
        console.error(
          "Voice Log Error:",
          error.response?.data || error.message
        );
        res
          .status(500)
          .json({ error: error.message || "Failed to process voice log" });
      }
    }
  );


  // --- Workout Generator (Protected) ---
  app.post("/api/ai/generate-workout", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const prompt = req.body.prompt;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      console.log("Generating workout for prompt:", prompt);

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

      const result = await model.generateContent(`
        You are an expert fitness coach.
        The user wants a workout based on this prompt: "${prompt}"

        Return a JSON object with this structure:
        {
          "workoutName": "Creative Workout Name",
          "exercises": [
            {
              "name": "Exercise Name",
              "sets": number,
              "reps": number,
              "weight": number (estimated placeholder, 0 if bodyweight),
              "unit": "kg" or "lbs",
              "notes": "Brief extraction of technique or tempo if relevant"
            }
          ]
        }
        Return ONLY valid JSON. No markdown formatting.
      `);

      const responseText = result.response.text();
      console.log("Gemini Output:", responseText);

      const jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const generatedPlan = JSON.parse(jsonStr);

      res.json(generatedPlan);
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ error: "Failed to generate workout plan" });
    }
  });

  app.post("/api/ai/generate-habits", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const prompt = req.body.prompt;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      console.log("Generating habits for prompt:", prompt);

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      // Use flash model for speed
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

      const result = await model.generateContent(`
        You are a habit formation expert.
        The user wants to build a routine based on this request: "${prompt}"

        Generate a list of 3 to 6 actionable, specific daily habits.
        
        Return a JSON object with this structure:
        {
          "habits": [
            "Drink 500ml water immediately after waking up",
            "Read 10 pages of a book",
            ...
          ]
        }
        Return ONLY valid JSON. No markdown formatting.
      `);

      const responseText = result.response.text();
      console.log("Gemini Habits Output:", responseText);

      const jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonStr);

      res.json(parsed.habits || []);
    } catch (error: any) {
      console.error("AI Habit Generation Error:", error);
      res.status(500).json({ error: "Failed to generate habits" });
    }
  });

  app.post("/api/workouts/batch", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { sectionId, workouts } = req.body;
      const userId = req.user!.id;

      if (!sectionId || !Array.isArray(workouts)) {
        return res.status(400).json({ error: "Invalid batch data" });
      }

      const savedWorkouts = [];
      for (const w of workouts) {
        const workoutData = {
          sectionId,
          exerciseType: w.name || w.exerciseType,
          sets: Number(w.sets) || 0,
          reps: Number(w.reps) || 0,
          weight: Number(w.weight) || 0,
          unit: w.unit || "kg",
          userId,
          date: new Date().toISOString(),
          completed: w.completed !== undefined ? w.completed : true // Respect flag, default to true
        };
        const saved = await storage.createWorkout(workoutData);
        savedWorkouts.push(saved);
      }

      res.json(savedWorkouts);
    } catch (error: any) {
      console.error("Batch Save Error:", error);
      res.status(500).json({ error: error.message || "Failed to save batch workouts" });
    }
  });

  // Toggle Workout Status
  app.patch("/api/workouts/:id/status", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const id = req.params.id;
      const { completed } = req.body;
      const updated = await storage.updateWorkoutStatus(id, completed);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update workout status" });
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

  // --- Library Sections (Protected) - MUST be before /:id routes ---
  app.get("/api/sections/library", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const sections = await storage.getLibrarySections(req.user!.id);
      res.json(sections);
    } catch (error: any) {
      console.error("GET /api/sections/library - error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get active (non-archived) library sections for dropdown
  app.get("/api/sections/library/active", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const sections = await storage.getActiveLibrarySections(req.user!.id);
      res.json(sections);
    } catch (error: any) {
      console.error("GET /api/sections/library/active - error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create library section (name-only)
  app.post("/api/sections/library", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ error: "name is required" });
        return;
      }
      const section = await storage.createLibrarySection({
        name,
        userId: req.user!.id
      });
      res.json(section);
    } catch (error: any) {
      console.error("POST /api/sections/library - error:", error);
      res.status(400).json({ error: error.message });
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

  app.patch("/api/sections/:id", authenticateToken, async (req: AuthRequest, res) => {
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
      const { name, targetSets, archived } = req.body;
      const updated = await storage.updateSection(req.params.id, {
        ...(name !== undefined && { name }),
        ...(targetSets !== undefined && { targetSets: Number(targetSets) }),
        ...(archived !== undefined && { archived })
      });
      res.json(updated);
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
      console.log("GET /api/workouts/week - Query params:", { startDate, endDate, userId: req.user!.id });
      const workouts = await storage.getWorkoutsByWeek(startDate as string, endDate as string, req.user!.id);
      console.log("GET /api/workouts/week - Found workouts:", workouts.length);
      // Prevent caching to ensure fresh data after mutations
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json(workouts);
    } catch (error: any) {
      console.error("GET /api/workouts/week - Error:", error);
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

  // Migration endpoint to fix null workout values
  app.post("/api/migrate/fix-workouts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { DbHelper } = await import("./dbHelper");
      const fixedCount = await DbHelper.migrateNullWorkoutValues();
      res.json({ success: true, fixedCount, message: `Fixed ${fixedCount} workouts with null values` });
    } catch (error: any) {
      console.error("Migration error:", error);
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

      // Calculate weekly progress
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

      // Get all user sections (show all on dashboard for overview)
      const sections = await storage.getAllSections(userId);

      const workouts = await storage.getAllWorkouts(userId);
      const completions = await storage.getAllCompletions(userId);

      const thisWeekWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.date);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      });

      const totalCompletedSets = thisWeekWorkouts.reduce((sum, w) => sum + w.sets, 0);
      const totalTargetSets = sections.reduce((sum, s) => sum + (s.targetSets ?? 0), 0);

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