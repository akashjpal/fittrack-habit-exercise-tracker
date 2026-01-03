import { randomUUID } from "crypto";
import {
  type ExerciseSection,
  type InsertExerciseSection,
  type Workout,
  type InsertWorkout,
  type Habit,
  type InsertHabit,
  type HabitCompletion,
  type InsertHabitCompletion,
  type User,
  type InsertUser,
} from "@shared/schema";
import { startOfDay, subDays } from "date-fns";
import { DbHelper } from "./dbHelper";

export interface IStorage {
  // Users
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  migrateOrphanedData(userId: string): Promise<void>;

  // Exercise Sections
  getAllSections(userId: string): Promise<ExerciseSection[]>;
  getSectionsByWeek(startDate: string, endDate: string, userId: string): Promise<ExerciseSection[]>;
  getSectionById(id: string): Promise<ExerciseSection | undefined>;
  createSection(section: InsertExerciseSection & { userId: string }): Promise<ExerciseSection>;
  deleteSection(id: string): Promise<void>;

  // Workouts
  getAllWorkouts(userId: string): Promise<Workout[]>;
  getWorkoutsBySection(sectionId: string): Promise<Workout[]>;
  getWorkoutsByWeek(startDate: string, endDate: string, userId: string): Promise<Workout[]>;
  createWorkout(workout: InsertWorkout & { userId: string }): Promise<Workout>;
  updateWorkoutStatus(id: string, completed: boolean): Promise<Workout>; // New method
  deleteWorkout(id: string): Promise<void>;

  // Habits
  getAllHabits(userId: string): Promise<Habit[]>;
  getHabitById(id: string): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit & { userId: string }): Promise<Habit>;
  deleteHabit(id: string): Promise<void>;

  // Habit Completions
  getHabitCompletions(habitId: string): Promise<HabitCompletion[]>;
  getAllCompletions(userId: string): Promise<HabitCompletion[]>;
  createCompletion(completion: InsertHabitCompletion & { userId: string }): Promise<HabitCompletion>;
  deleteCompletion(habitId: string, dateString: string): Promise<void>;
}

export class MemStorage implements IStorage {
  // Users
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const doc = await DbHelper.getUserByUsername(username);
      if (!doc) return undefined;
      return { ...doc, id: doc.$id } as unknown as User;
    } catch (err) {
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const doc = await DbHelper.createUser({
      username: user.username,
      passwordHash: user.password,
    });
    return { ...doc, id: doc.$id } as unknown as User;
  }

  async migrateOrphanedData(userId: string): Promise<void> {
    await DbHelper.migrateOrphanedData(userId);
  }

  // Exercise Sections
  async getAllSections(userId: string): Promise<ExerciseSection[]> {
    try {
      const result = await DbHelper.getAllExerciseSections(userId);
      return result.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        createdAt: doc.$createdAt,
        date: doc.date // Ensure date is mapped
      })) as unknown as ExerciseSection[];
    }
    catch (err) {
      console.error("Error fetching exercise sections from DB:", err);
      throw err;
    }
  }

  async getSectionsByWeek(startDate: string, endDate: string, userId: string): Promise<ExerciseSection[]> {
    try {
      const result = await DbHelper.getExerciseSectionsByWeek(startDate, endDate, userId);
      return result.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        createdAt: doc.$createdAt,
        date: doc.date
      })) as unknown as ExerciseSection[];
    }
    catch (err) {
      console.error("Error fetching exercise sections by week from DB:", err);
      throw err;
    }
  }

  async getSectionById(id: string): Promise<ExerciseSection | undefined> {
    try {
      const result = await DbHelper.getExerciseSection(id);
      return { ...result, id: result.$id } as unknown as ExerciseSection;
    }
    catch (err) {
      console.error("Error fetching exercise section by ID from DB:", err);
      throw err;
    }
  }

  async createSection(section: InsertExerciseSection & { userId: string }): Promise<ExerciseSection> {
    const newSection = await DbHelper.createExerciseSection({
      name: section.name,
      targetSets: section.targetSets,
      date: section.date,
      userId: section.userId
    });
    return { ...newSection, id: newSection.$id } as unknown as ExerciseSection;
  }

  async deleteSection(id: string): Promise<void> {
    try {
      // First delete all workouts in this section
      const workouts = await DbHelper.getWorkoutsBySection(id);
      for (const workout of workouts.documents) {
        await DbHelper.deleteWorkout(workout.$id);
      }

      // Then delete the section
      await DbHelper.deleteExerciseSection(id);
    }
    catch (err) {
      console.error("Error deleting exercise section from DB:", err);
      throw err;
    }
  }

  // Workouts
  async getAllWorkouts(userId: string): Promise<Workout[]> {
    try {
      const result = await DbHelper.getWorkout(userId);
      return result.documents.map(doc => ({ ...doc, id: doc.$id })) as unknown as Workout[];
    } catch (err) {
      console.error("Error fetching workouts from DB:", err);
      throw err;
    }
  }

  async getWorkoutsBySection(sectionId: string): Promise<Workout[]> {
    try {
      const result = await DbHelper.getWorkoutsBySection(sectionId);
      return result.documents.map(doc => ({ ...doc, id: doc.$id })) as unknown as Workout[];
    }
    catch (err) {
      console.error("Error fetching workouts by section from DB:", err);
      throw err;
    }
  }
  async getWorkoutsByWeek(startDate: string, endDate: string, userId: string): Promise<Workout[]> {
    try {
      const result = await DbHelper.getWorkoutsByWeek(startDate, endDate, userId);
      return result.documents.map(doc => ({ ...doc, id: doc.$id })) as unknown as Workout[];
    }
    catch (err) {
      console.error("Error fetching workouts by week from DB:", err);
      throw err;
    }
  }

  async createWorkout(workout: InsertWorkout & { userId: string }): Promise<Workout> {
    const workoutDate = workout.date || new Date().toISOString();
    const newWorkout = await DbHelper.createWorkout({
      sectionId: workout.sectionId,
      exerciseType: workout.exerciseType,
      sets: workout.sets,
      reps: workout.reps,
      weight: workout.weight,
      unit: workout.unit,
      date: workoutDate,
      completed: workout.completed ?? true, // Default to true if not specified
      userId: workout.userId
    });
    return { ...newWorkout, id: newWorkout.$id } as unknown as Workout;
  }

  async updateWorkoutStatus(id: string, completed: boolean): Promise<Workout> {
    const updated = await DbHelper.updateWorkoutStatus(id, completed);
    return { ...updated, id: updated.$id } as unknown as Workout;
  }

  async deleteWorkout(id: string): Promise<void> {
    try {
      await DbHelper.deleteWorkout(id);
    }
    catch (err) {
      console.error("Error deleting workout from DB:", err);
      throw err;
    }
  }

  // Habits
  async getAllHabits(userId: string): Promise<Habit[]> {
    try {
      const result = await DbHelper.getAllHabits(userId);
      return result.documents.map(doc => ({ ...doc, id: doc.$id })) as unknown as Habit[];
    }
    catch (err) {
      console.error("Error fetching habits from DB:", err);
      throw err;
    }
  }

  async getHabitById(id: string): Promise<Habit | undefined> {
    try {
      const result = await DbHelper.getHabit(id);
      return { ...result, id: result.$id } as unknown as Habit;
    }
    catch (err) {
      console.error("Error fetching habit by ID from DB:", err);
      throw err;
    }
  }

  async createHabit(habit: InsertHabit & { userId: string }): Promise<Habit> {
    const newHabit = await DbHelper.createHabit({
      name: habit.name,
      frequency: habit.frequency,
      userId: habit.userId
    });
    return { ...newHabit, id: newHabit.$id } as unknown as Habit;
  }

  async deleteHabit(id: string): Promise<void> {
    try {
      await DbHelper.deleteHabit(id);
    }
    catch (err) {
      console.error("Error deleting habit from DB:", err);
      throw err;
    }
  }

  // Habit Completions
  async getHabitCompletions(habitId: string): Promise<HabitCompletion[]> {
    try {
      const result = await DbHelper.getHabitCompletion(habitId);
      return result.documents.map(doc => ({ ...doc, id: doc.$id })) as unknown as HabitCompletion[];
    }
    catch (err) {
      console.error("Error fetching habit completions from DB:", err);
      throw err;
    }
  }

  async getAllCompletions(userId: string): Promise<HabitCompletion[]> {
    try {
      const result = await DbHelper.getAllHabitCompletions(userId);
      return result.documents.map(doc => ({ ...doc, id: doc.$id })) as unknown as HabitCompletion[];
    }
    catch (err) {
      console.error("Error fetching all habit completions from DB:", err);
      throw err;
    }
  }

  async createCompletion(completion: InsertHabitCompletion & { userId: string }): Promise<HabitCompletion> {
    const completionDate = typeof completion.date === 'string'
      ? new Date(completion.date)
      : completion.date;

    const newCompletion = await DbHelper.createHabitCompletion({
      habitId: completion.habitId,
      date: startOfDay(completionDate).toISOString(),
      userId: completion.userId
    });
    return { ...newCompletion, id: newCompletion.$id } as unknown as HabitCompletion;
  }

  async deleteCompletion(habitId: string, dateString: string): Promise<void> {
    try {
      const completions = await DbHelper.getHabitCompletion(habitId);
      const targetDate = startOfDay(new Date(dateString)).toISOString();
      for (const completion of completions.documents as any[]) {
        const completionDate = startOfDay(new Date(completion.date)).toISOString();
        if (
          completion.habitId === habitId &&
          completionDate === targetDate
        ) {
          await DbHelper.deleteHabitCompletion(completion.$id);
          return;
        }
      }
    }
    catch (err) {
      console.error("Error deleting habit completion from DB:", err);
      throw err;
    }
  }
}

export const storage = new MemStorage();
