/**
 * Backward-compatible re-export of all types.
 * Client code can continue importing from "@shared/schema".
 * Types use camelCase to match the API response format.
 */
export type {
  ExerciseSection,
  Workout,
  Habit,
  HabitCompletion,
} from "./src/index";

// Also re-export schemas and DTOs for any code that needs them
export {
  exerciseSectionSchema,
  createSectionSchema,
  updateSectionSchema,
  workoutSchema,
  createWorkoutSchema,
  batchCreateWorkoutSchema,
  habitSchema,
  createHabitSchema,
  habitCompletionSchema,
  createCompletionSchema,
} from "./src/index";

export type {
  ExerciseSectionRow,
  CreateSectionDto,
  UpdateSectionDto,
  WorkoutRow,
  CreateWorkoutDto,
  BatchCreateWorkoutDto,
  HabitRow,
  CreateHabitDto,
  HabitCompletionRow,
  CreateCompletionDto,
} from "./src/index";

// Legacy type aliases for pages that import Insert* types
import type { ExerciseSection, Workout, Habit, HabitCompletion } from "./src/index";

export type InsertExerciseSection = Omit<ExerciseSection, "id" | "createdAt" | "updatedAt">;
export type InsertWorkout = Omit<Workout, "id" | "createdAt" | "updatedAt">;
export type InsertHabit = Omit<Habit, "id" | "createdAt" | "updatedAt">;
export type InsertHabitCompletion = Omit<HabitCompletion, "id" | "createdAt">;

