import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertExerciseSectionSchema,
  insertWorkoutSchema,
  insertHabitSchema,
  insertHabitCompletionSchema,
} from "@shared/schema";
import { startOfDay, subDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";

import { registerAIRoutes } from "./ai-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  registerAIRoutes(app);
  // Exercise Sections
  app.get("/api/sections", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let sections;
      if (startDate && endDate) {
        sections = await storage.getSectionsByWeek(startDate as string, endDate as string);
      } else {
        sections = await storage.getAllSections();
      }
      res.json(sections);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/sections", async (req, res) => {
    try {
      const data = insertExerciseSectionSchema.parse(req.body);
      const section = await storage.createSection(data);
      res.json(section);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/sections/:id", async (req, res) => {
    try {
      await storage.deleteSection(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Workouts
  app.get("/api/workouts", async (_req, res) => {
    try {
      const workouts = await storage.getAllWorkouts();
      res.json(workouts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workouts/section/:sectionId", async (req, res) => {
    try {
      const workouts = await storage.getWorkoutsBySection(req.params.sectionId);
      res.json(workouts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workouts/week", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      console.log(`Fetching workouts for week: ${startDate} to ${endDate}`);
      const workouts = await storage.getWorkoutsByWeek(startDate as string, endDate as string);
      console.log(`Found ${workouts.length} workouts`);
      res.json(workouts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      console.log("api workout hitting");
      console.log("Request body:", req.body);
      const data = req.body;
      console.log("Parsed workout data:", data);
      const workout = await storage.createWorkout(data);
      res.json(workout);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/workouts/:id", async (req, res) => {
    try {
      await storage.deleteWorkout(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Habits
  app.get("/api/habits", async (_req, res) => {
    try {
      const habits = await storage.getAllHabits();
      res.json(habits);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/habits", async (req, res) => {
    try {
      // const data = insertHabitSchema.parse(req.body);
      const data = req.body;
      const habit = await storage.createHabit(data);
      res.json(habit);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/habits/:id", async (req, res) => {
    try {
      await storage.deleteHabit(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Habit Completions
  app.get("/api/habits/:habitId/completions", async (req, res) => {
    try {
      const completions = await storage.getHabitCompletions(req.params.habitId);
      res.json(completions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/completions", async (_req, res) => {
    try {
      const completions = await storage.getAllCompletions();
      res.json(completions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/completions", async (req, res) => {
    try {
      // const data = insertHabitCompletionSchema.parse(req.body);
      const data = req.body;
      const completion = await storage.createCompletion(data);
      res.json(completion);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/completions/:habitId/:date", async (req, res) => {
    try {
      await storage.deleteCompletion(req.params.habitId, req.params.date);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/dashboard", async (_req, res) => {
    try {
      const sections = await storage.getAllSections();
      const workouts = await storage.getAllWorkouts();
      const completions = await storage.getAllCompletions();

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

  app.get("/api/analytics/progress", async (req, res) => {
    try {
      const workouts = await storage.getAllWorkouts();
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
