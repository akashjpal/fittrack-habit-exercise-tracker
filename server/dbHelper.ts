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
// Collection Ids
const COLLECTIONS = {
  exerciseSections: process.env.APPWRITE_COLLECTION_ID_EXERCISE_SECTIONS!,
  workouts: process.env.APPWRITE_COLLECTION_ID_WORKOUTS!,
  habits: process.env.APPWRITE_COLLECTION_ID_HABITS!,
  habitCompletions: process.env.APPWRITE_COLLECTION_ID_HABIT_COMPLETIONS!,
  users: process.env.APPWRITE_COLLECTION_ID_USERS!
};

console.log("Loaded Collection IDs:", COLLECTIONS);

export class DbHelper {
  // Users CRUD
  static async createUser(data: { username: string; passwordHash: string }) {
    console.log("Creating user:", data);
    return databases.createDocument(databaseId, COLLECTIONS.users, ID.unique(), {
      username: data.username,
      password: data.passwordHash,
    });
  }

  static async getUserByUsername(username: string) {
    const result = await databases.listDocuments(databaseId, COLLECTIONS.users, [
      Query.equal("username", username)
    ]);
    return result.documents[0];
  }

  // Migration Logic
  static async migrateOrphanedData(userId: string) {
    console.log(`Starting migration of orphaned data to user: ${userId}`);
    const collections = [
      COLLECTIONS.exerciseSections,
      COLLECTIONS.workouts,
      COLLECTIONS.habits,
      COLLECTIONS.habitCompletions
    ];

    for (const collectionId of collections) {
      let hasMore = true;
      let cursor = null;

      while (hasMore) {
        const queries = [
          Query.limit(100),
          // We want docs where userId is missing (null). 
          // Appwrite query for null might vary, usually Query.isNull("userId") or just list all and filter in code if index missing.
          // Assuming we can just list all for now and check.
        ];

        if (cursor) {
          queries.push(Query.cursorAfter(cursor));
        }

        const result = await databases.listDocuments(databaseId, collectionId, queries);

        if (result.documents.length === 0) {
          hasMore = false;
          break;
        }

        for (const doc of result.documents) {
          if (!doc.userId) {
            await databases.updateDocument(databaseId, collectionId, doc.$id, {
              userId: userId
            });
            console.log(`Migrated ${collectionId} doc ${doc.$id} to user ${userId}`);
          }
        }

        cursor = result.documents[result.documents.length - 1].$id;
        if (result.documents.length < 100) {
          hasMore = false;
        }
      }
    }
    console.log("Migration completed.");
  }

  // Exercise Sections CRUD
  static async createExerciseSection(data: { name: string; targetSets: number; date: string; userId: string }) {
    return databases.createDocument(databaseId, COLLECTIONS.exerciseSections, ID.unique(), {
      name: data.name,
      targetSets: data.targetSets,
      date: data.date,
      userId: data.userId
    });
  }

  static async getExerciseSection(id: string) {
    return databases.getDocument(databaseId, COLLECTIONS.exerciseSections, id);
  }

  static async getAllExerciseSections(userId: string) {
    return databases.listDocuments(databaseId, COLLECTIONS.exerciseSections, [
      Query.equal("userId", userId)
    ]);
  }

  static async getExerciseSectionsByWeek(startDate: string, endDate: string, userId: string) {
    return databases.listDocuments(databaseId, COLLECTIONS.exerciseSections, [
      Query.between("date", startDate, endDate),
      Query.equal("userId", userId)
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
    userId: string;
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
        date: data.date,
        userId: data.userId
      });
    } catch (err: any) {
      console.error("CREATE WORKOUT ERROR:", err?.message || err);
      throw err;
    }
  }

  static async getWorkout(userId: string) {
    return databases.listDocuments(databaseId, COLLECTIONS.workouts, [
      Query.equal("userId", userId)
    ]);
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

  static async getWorkoutsByWeek(startDate: string, endDate: string, userId: string) {
    try {
      const result = await databases.listDocuments(
        databaseId,
        COLLECTIONS.workouts,
        [
          Query.greaterThanEqual("date", startDate),
          Query.lessThanEqual("date", endDate),
          Query.equal("userId", userId)
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
  static async createHabit(data: { name: string; frequency: "daily" | "weekly"; userId: string }) {
    return databases.createDocument(databaseId, COLLECTIONS.habits, ID.unique(), {
      name: data.name,
      frequency: data.frequency,
      userId: data.userId
    });
  }

  static async getHabit(id: string) {
    return databases.getDocument(databaseId, COLLECTIONS.habits, id);
  }

  static async getAllHabits(userId: string) {
    return databases.listDocuments(databaseId, COLLECTIONS.habits, [
      Query.equal("userId", userId)
    ]);
  }

  static async updateHabit(id: string, data: Partial<{ name: string; frequency: "daily" | "weekly" }>) {
    return databases.updateDocument(databaseId, COLLECTIONS.habits, id, data);
  }

  static async deleteHabit(id: string) {
    return databases.deleteDocument(databaseId, COLLECTIONS.habits, id);
  }

  // Habit Completions CRUD
  static async createHabitCompletion(data: { habitId: string; date: string; userId: string }) {
    return databases.createDocument(databaseId, COLLECTIONS.habitCompletions, ID.unique(), {
      habitId: data.habitId,
      date: data.date,
      userId: data.userId
    });
  }

  static async getHabitCompletion(habitId: string) {
    return databases.listDocuments(databaseId, COLLECTIONS.habitCompletions, [
      Query.equal("habitId", habitId)
    ]);
  }

  static async getAllHabitCompletions(userId: string) {
    return databases.listDocuments(databaseId, COLLECTIONS.habitCompletions, [
      Query.equal("userId", userId)
    ]);
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
