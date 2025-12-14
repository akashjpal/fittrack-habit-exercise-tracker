import { z } from "zod";

// Exercise Section Schema
export const exerciseSectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetSets: z.number(),
  date: z.string(), // ISO string for the week/date
  createdAt: z.string(), // ISO string from Date.toISOString()
  userId: z.string().optional(), // Added userId
});

export const insertExerciseSectionSchema = exerciseSectionSchema.omit({
  id: true,
  createdAt: true
});

export type ExerciseSection = z.infer<typeof exerciseSectionSchema>;
export type InsertExerciseSection = z.infer<typeof insertExerciseSectionSchema>;

// Workout Schema
export const workoutSchema = z.object({
  id: z.string(),
  sectionId: z.string(),
  exerciseType: z.string(),
  sets: z.number(),
  reps: z.number(),
  weight: z.number(),
  unit: z.string(),
  date: z.string(), // ISO string from Date.toISOString()
  completed: z.boolean().default(true), // Added completed status
  userId: z.string().optional(), // Added userId
});

export const insertWorkoutSchema = workoutSchema.omit({
  id: true,
  date: true
}).extend({
  date: z.string().optional()
});

export type Workout = z.infer<typeof workoutSchema>;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

// Habit Schema
export const habitSchema = z.object({
  id: z.string(),
  name: z.string(),
  frequency: z.enum(['daily', 'weekly']),
  createdAt: z.string(), // ISO string from Date.toISOString()
  userId: z.string().optional(), // Added userId
});

export const insertHabitSchema = habitSchema.omit({
  id: true,
  createdAt: true
});

export type Habit = z.infer<typeof habitSchema>;
export type InsertHabit = z.infer<typeof insertHabitSchema>;

// Habit Completion Schema
export const habitCompletionSchema = z.object({
  id: z.string(),
  habitId: z.string(),
  date: z.string(), // ISO string from Date.toISOString()
  userId: z.string().optional(), // Added userId
});

export const insertHabitCompletionSchema = habitCompletionSchema.omit({
  id: true
});

export type HabitCompletion = z.infer<typeof habitCompletionSchema>;
export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;

// User Schema
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string(),
  createdAt: z.string(),
});

export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

