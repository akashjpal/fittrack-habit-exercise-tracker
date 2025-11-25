import { Client, Databases, ID, Query } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config();

const client = new Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || "http://localhost/v1")
  .setProject(process.env.APPWRITE_PROJECT_ID || "your_project_id")
  .setKey(process.env.APPWRITE_API_KEY || "your_api_key");

const databases = new Databases(client);
const databaseId = process.env.APPWRITE_DATABASE_ID || "your_database_id";

// Collection Ids (replace with your actual collection ids)
const COLLECTIONS = {
  exerciseSections: "exercise_sections_collection_id",
  workouts: "workouts_collection_id",
  habits: "habits_collection_id",
  habitCompletions: "habit_completions_collection_id",
};

export class DbHelper {
  // Exercise Sections CRUD
  static async createExerciseSection(data: { name: string; targetSets: number; date: string }) {
    return databases.createDocument(databaseId, COLLECTIONS.exerciseSections, "unique()", {
      name: data.name,
      targetSets: data.targetSets,
      date: data.date
    });
  }

  static async getExerciseSection(id: string) {
    return databases.getDocument(databaseId, COLLECTIONS.exerciseSections, id);
  }

  static async getAllExerciseSections() {
    return databases.listDocuments(databaseId, COLLECTIONS.exerciseSections);
  }

  static async getExerciseSectionsByWeek(startDate: string, endDate: string) {
    return databases.listDocuments(databaseId, COLLECTIONS.exerciseSections, [
      Query.between("date", startDate, endDate)
    ]);
  }

  static async updateExerciseSection(id: string, data: Partial<{ name: string; targetSets: number }>) {
    return databases.updateDocument(databaseId, COLLECTIONS.exerciseSections, id, data);
  }

  static async deleteExerciseSection(id: string) {
    return databases.deleteDocument(databaseId, COLLECTIONS.exerciseSections, id);
  }

  // Workouts CRUD
  static async createWorkout(data: {
    sectionId: string;
    exerciseType: string;
    sets: number;
    reps: number;
    weight: number;
    unit: string;
    date: string;
  }) {
    try {
      console.log("CREATE WORKOUT DATA:", data);
      return databases.createDocument(databaseId, COLLECTIONS.workouts, ID.unique(), {
        sectionId: data.sectionId,
        exerciseType: data.exerciseType,
        sets: data.sets,
        reps: data.reps,
        weight: data.weight,
        unit: data.unit,
        date: data.date
      });
    } catch (err: any) {
      console.error("CREATE WORKOUT ERROR:", err?.message || err);
      throw err;
    }
  }

  static async getWorkout() {
    return databases.listDocuments(databaseId, COLLECTIONS.workouts);
  }

  static async getWorkoutsBySection(sectionId: string) {
    try {
      const result = await databases.listDocuments(
        databaseId,
        COLLECTIONS.workouts,
        [
          Query.equal("sectionId", sectionId)
        ]
      );

      return result;
    } catch (err: any) {
      console.error("LIST ERROR:", err?.message || err);
      throw err;
    }
  }

  static async getWorkoutsByWeek(startDate: string, endDate: string) {
    try {
      const result = await databases.listDocuments(
        databaseId,
        COLLECTIONS.workouts,
        [
          Query.between("date", startDate, endDate)
        ]
      );

      return result;
    } catch (err: any) {
      console.error("LIST ERROR:", err?.message || err);
      throw err;
    }
  }

  static async updateWorkout(id: string, data: Partial<{
    sectionId: string;
    exerciseType: string;
    sets: number;
    reps: number;
    weight: number;
    unit: string;
    date: string;
  }>) {
    return databases.updateDocument(databaseId, COLLECTIONS.workouts, id, data);
  }

  static async deleteWorkout(id: string) {
    return databases.deleteDocument(databaseId, COLLECTIONS.workouts, id);
  }

  // Habits CRUD
  static async createHabit(data: { name: string; frequency: "daily" | "weekly" }) {
    return databases.createDocument(databaseId, COLLECTIONS.habits, "unique()", {
      name: data.name,
      frequency: data.frequency
    });
  }

  static async getHabit(id: string) {
    return databases.getDocument(databaseId, COLLECTIONS.habits, id);
  }

  static async getAllHabits() {
    return databases.listDocuments(databaseId, COLLECTIONS.habits);
  }

  static async updateHabit(id: string, data: Partial<{ name: string; frequency: "daily" | "weekly" }>) {
    return databases.updateDocument(databaseId, COLLECTIONS.habits, id, data);
  }

  static async deleteHabit(id: string) {
    return databases.deleteDocument(databaseId, COLLECTIONS.habits, id);
  }

  // Habit Completions CRUD
  static async createHabitCompletion(data: { id: string, habitId: string; date: string }) {
    return databases.createDocument(databaseId, COLLECTIONS.habitCompletions, "unique()", {
      habitId: data.habitId,
      date: data.date
    });
  }

  static async getHabitCompletion(habitId: string) {
    return databases.listDocuments(databaseId, COLLECTIONS.habitCompletions, [
      Query.equal("habitId", habitId)
    ]);
  }

  static async getAllHabitCompletions() {
    return databases.listDocuments(databaseId, COLLECTIONS.habitCompletions);
  }

  static async getHabitCompletionsByHabit(habitId: string) {
    return databases.listDocuments(databaseId, COLLECTIONS.habitCompletions, [
      Query.equal("habitId", habitId),
    ]);
  }

  static async deleteHabitCompletion(id: string) {
    return databases.deleteDocument(databaseId, COLLECTIONS.habitCompletions, id);
  }
}
