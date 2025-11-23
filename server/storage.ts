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
} from "@shared/schema";
import { startOfDay, subDays } from "date-fns";
import { DbHelper } from "./dbHelper";

export interface IStorage {
  // Exercise Sections
  getAllSections(): Promise<ExerciseSection[]>;
  getSectionById(id: string): Promise<ExerciseSection | undefined>;
  createSection(section: InsertExerciseSection): Promise<ExerciseSection>;
  deleteSection(id: string): Promise<void>;

  // Workouts
  getAllWorkouts(): Promise<Workout[]>;
  getWorkoutsBySection(sectionId: string): Promise<Workout[]>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  deleteWorkout(id: string): Promise<void>;

  // Habits
  getAllHabits(): Promise<Habit[]>;
  getHabitById(id: string): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  deleteHabit(id: string): Promise<void>;

  // Habit Completions
  getHabitCompletions(habitId: string): Promise<HabitCompletion[]>;
  getAllCompletions(): Promise<HabitCompletion[]>;
  createCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  deleteCompletion(habitId: string, dateString: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private sections: Map<string, ExerciseSection>;
  private workouts: Map<string, Workout>;
  private habits: Map<string, Habit>;
  private completions: Map<string, HabitCompletion>;

  constructor() {
    this.sections = new Map();
    this.workouts = new Map();
    this.habits = new Map();
    this.completions = new Map();
  }

  private async createSectionSync(section: InsertExerciseSection): Promise<ExerciseSection> {
    const id = randomUUID();
    const newSection: ExerciseSection = {
      ...section,
      id,
      createdAt: new Date().toISOString(),
    };
    await DbHelper.createExerciseSection(newSection);
    return newSection;
  }

  // TODO: Create workout linked to DB -> need to check
  private async createWorkoutSync(workout: InsertWorkout, date?: Date): Promise<Workout> {
    console.log("Creating workout:", workout, "with date:", date);
    const id = randomUUID();
    const newWorkout: Workout = {
      ...workout,
      id,
      date: date ? date.toISOString() : new Date().toISOString(),
    };
    try {
      console.log("Creating workout in DB:", newWorkout);
      await DbHelper.createWorkout(newWorkout);
      return newWorkout;
    }
    catch (err) {
      console.error("Error creating workout in DB:", err);
      throw err;
    }
  }

  // working
  private async createHabitSync(habit: InsertHabit): Promise<Habit> {
    const id = randomUUID();
    const newHabit: Habit = {
      ...habit,
      id,
      createdAt: new Date().toISOString(),
    };
    await DbHelper.createHabit(newHabit);
    return newHabit;
  }

  // TODO: Need to check
  private async createCompletionSync(completion: InsertHabitCompletion): Promise<HabitCompletion> {
    const id = randomUUID();
    const completionDate = typeof completion.date === 'string'
      ? new Date(completion.date)
      : completion.date;
    const newCompletion: HabitCompletion = {
      id,
      habitId: completion.habitId,
      date: startOfDay(completionDate).toISOString(),
    };
    await DbHelper.createHabitCompletion(newCompletion);
    console.log("Habbit completion created:", newCompletion);
    return newCompletion;
  }

  // Exercise Sections
  async getAllSections(): Promise<ExerciseSection[]> {
    try {
      const result = await DbHelper.getAllExerciseSections();
      return result.documents.map(doc => ({ ...doc, id: doc.$id })) as unknown as ExerciseSection[];
    }
    catch (err) {
      console.error("Error fetching exercise sections from DB:", err);
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

  async createSection(section: InsertExerciseSection): Promise<ExerciseSection> {
    return this.createSectionSync(section);
  }

  async deleteSection(id: string): Promise<void> {
    try {
      await DbHelper.deleteExerciseSection(id);
    }
    catch (err) {
      console.error("Error deleting exercise section from DB:", err);
      throw err;
    }
  }

  // Workouts -> completed
  async getAllWorkouts(): Promise<Workout[]> {
    try {
      const result = await DbHelper.getWorkout();
      return result.documents.map(doc => ({ ...doc, id: doc.$id })) as unknown as Workout[];
    } catch (err) {
      console.error("Error fetching workouts from DB:", err);
      throw err;
    }
  }

  async getWorkoutsBySection(sectionId: string): Promise<Workout[]> {
    try {
      const result = await DbHelper.getWorkoutsBySection(sectionId);
      console.log(result);
      return result.documents.map(doc => ({ ...doc, id: doc.$id })) as unknown as Workout[];
    }
    catch (err) {
      console.error("Error fetching workouts by section from DB:", err);
      throw err;
    }
  }
  // TODO: Need to check
  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    return this.createWorkoutSync(workout);
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

  // Habits -> done
  async getAllHabits(): Promise<Habit[]> {
    try {
      const result = await DbHelper.getAllHabits();
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

  async createHabit(habit: InsertHabit): Promise<Habit> {
    return this.createHabitSync(habit);
  }

  async deleteHabit(id: string): Promise<void> {
    this.habits.delete(id);
    // Also delete associated completions
    for (const [completionId, completion] of Array.from(this.completions.entries())) {
      if (completion.habitId === id) {
        this.completions.delete(completionId);
      }
    }
    try {
      await DbHelper.deleteHabit(id);
    }
    catch (err) {
      console.error("Error deleting habit from DB:", err);
      throw err;
    }
  }

  // Habit Completions -> done
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

  async getAllCompletions(): Promise<HabitCompletion[]> {
    try {
      const result = await DbHelper.getAllHabitCompletions();
      return result.documents.map(doc => ({ ...doc, id: doc.$id })) as unknown as HabitCompletion[];
    }
    catch (err) {
      console.error("Error fetching all habit completions from DB:", err);
      throw err;
    }
  }

  async createCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion> {
    return this.createCompletionSync(completion);
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
