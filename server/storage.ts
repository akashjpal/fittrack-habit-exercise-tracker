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
  deleteCompletion(habitId: string, date: Date): Promise<void>;
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
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed exercise sections
    const chestSection = this.createSectionSync({
      name: "Chest",
      targetSets: 12,
    });
    const backSection = this.createSectionSync({
      name: "Back",
      targetSets: 15,
    });
    const legsSection = this.createSectionSync({
      name: "Legs",
      targetSets: 10,
    });
    this.createSectionSync({ name: "Shoulders", targetSets: 10 });
    this.createSectionSync({ name: "Arms", targetSets: 12 });

    // Seed workouts
    this.createWorkoutSync({
      sectionId: chestSection.id,
      exerciseType: "Bench Press",
      sets: 4,
      reps: 10,
      weight: 60,
      unit: "kg",
    }, subDays(new Date(), 1));

    this.createWorkoutSync({
      sectionId: chestSection.id,
      exerciseType: "Incline Dumbbell Press",
      sets: 3,
      reps: 12,
      weight: 25,
      unit: "kg",
    }, subDays(new Date(), 3));

    this.createWorkoutSync({
      sectionId: backSection.id,
      exerciseType: "Pull-ups",
      sets: 4,
      reps: 8,
      weight: 0,
      unit: "kg",
    }, subDays(new Date(), 2));

    this.createWorkoutSync({
      sectionId: backSection.id,
      exerciseType: "Barbell Rows",
      sets: 4,
      reps: 10,
      weight: 50,
      unit: "kg",
    }, subDays(new Date(), 4));

    this.createWorkoutSync({
      sectionId: legsSection.id,
      exerciseType: "Squats",
      sets: 4,
      reps: 8,
      weight: 80,
      unit: "kg",
    }, subDays(new Date(), 3));

    // Seed habits
    const workout = this.createHabitSync({
      name: "Morning Workout",
      frequency: "daily",
    });
    const reading = this.createHabitSync({
      name: "Read 30 Minutes",
      frequency: "daily",
    });
    const meditation = this.createHabitSync({
      name: "Meditate",
      frequency: "daily",
    });

    // Seed habit completions
    for (let i = 0; i < 6; i++) {
      this.createCompletionSync({
        habitId: workout.id,
        date: subDays(new Date(), i).toISOString(),
      });
    }
    for (let i = 0; i < 3; i++) {
      this.createCompletionSync({
        habitId: reading.id,
        date: subDays(new Date(), i).toISOString(),
      });
    }
    for (let i = 0; i < 2; i++) {
      this.createCompletionSync({
        habitId: meditation.id,
        date: subDays(new Date(), i).toISOString(),
      });
    }
  }

  private createSectionSync(section: InsertExerciseSection): ExerciseSection {
    const id = randomUUID();
    const newSection: ExerciseSection = {
      ...section,
      id,
      createdAt: new Date().toISOString(),
    };
    this.sections.set(id, newSection);
    return newSection;
  }

  private createWorkoutSync(workout: InsertWorkout, date?: Date): Workout {
    const id = randomUUID();
    const newWorkout: Workout = {
      ...workout,
      id,
      date: (date || new Date()).toISOString(),
    };
    this.workouts.set(id, newWorkout);
    return newWorkout;
  }

  private createHabitSync(habit: InsertHabit): Habit {
    const id = randomUUID();
    const newHabit: Habit = {
      ...habit,
      id,
      createdAt: new Date().toISOString(),
    };
    this.habits.set(id, newHabit);
    return newHabit;
  }

  private createCompletionSync(completion: InsertHabitCompletion): HabitCompletion {
    const id = randomUUID();
    const completionDate = typeof completion.date === 'string' 
      ? new Date(completion.date)
      : completion.date;
    const newCompletion: HabitCompletion = {
      id,
      habitId: completion.habitId,
      date: startOfDay(completionDate).toISOString(),
    };
    this.completions.set(id, newCompletion);
    return newCompletion;
  }

  // Exercise Sections
  async getAllSections(): Promise<ExerciseSection[]> {
    return Array.from(this.sections.values());
  }

  async getSectionById(id: string): Promise<ExerciseSection | undefined> {
    return this.sections.get(id);
  }

  async createSection(section: InsertExerciseSection): Promise<ExerciseSection> {
    return this.createSectionSync(section);
  }

  async deleteSection(id: string): Promise<void> {
    this.sections.delete(id);
    // Also delete associated workouts
    for (const [workoutId, workout] of Array.from(this.workouts.entries())) {
      if (workout.sectionId === id) {
        this.workouts.delete(workoutId);
      }
    }
  }

  // Workouts
  async getAllWorkouts(): Promise<Workout[]> {
    return Array.from(this.workouts.values());
  }

  async getWorkoutsBySection(sectionId: string): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter((w) => w.sectionId === sectionId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    return this.createWorkoutSync(workout);
  }

  async deleteWorkout(id: string): Promise<void> {
    this.workouts.delete(id);
  }

  // Habits
  async getAllHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values());
  }

  async getHabitById(id: string): Promise<Habit | undefined> {
    return this.habits.get(id);
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
  }

  // Habit Completions
  async getHabitCompletions(habitId: string): Promise<HabitCompletion[]> {
    return Array.from(this.completions.values()).filter(
      (c) => c.habitId === habitId
    );
  }

  async getAllCompletions(): Promise<HabitCompletion[]> {
    return Array.from(this.completions.values());
  }

  async createCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion> {
    return this.createCompletionSync(completion);
  }

  async deleteCompletion(habitId: string, date: Date): Promise<void> {
    const targetDate = startOfDay(date).toISOString();
    for (const [id, completion] of Array.from(this.completions.entries())) {
      if (
        completion.habitId === habitId &&
        completion.date === targetDate
      ) {
        this.completions.delete(id);
        return;
      }
    }
  }
}

export const storage = new MemStorage();
