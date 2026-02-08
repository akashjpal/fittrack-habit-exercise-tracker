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
  static async createExerciseSection(data: {
    name: string;
    targetSets: number;
    date: string;
    userId: string;
    isLibrary?: boolean;
    archived?: boolean;
  }) {
    return databases.createDocument(databaseId, COLLECTIONS.exerciseSections, ID.unique(), {
      name: data.name,
      targetSets: data.targetSets,
      date: data.date,
      userId: data.userId,
      isLibrary: data.isLibrary || false,
      archived: data.archived || false
    });
  }
 
  // Create a library section (name-only template)
  static async createLibrarySection(data: { name: string; userId: string }) {
    return databases.createDocument(databaseId, COLLECTIONS.exerciseSections, ID.unique(), {
      name: data.name,
      date: new Date().toISOString(),
      userId: data.userId,
      isLibrary: true,
      archived: false
    });
  }

  // Get only library sections (isLibrary = true)
  static async getLibrarySections(userId: string) {
    return databases.listDocuments(databaseId, COLLECTIONS.exerciseSections, [
      Query.equal("userId", userId),
      Query.equal("isLibrary", true),
      Query.limit(5000)
    ]);
  }

  // Get active (non-archived) library sections for dropdown
  static async getActiveLibrarySections(userId: string) {
    return databases.listDocuments(databaseId, COLLECTIONS.exerciseSections, [
      Query.equal("userId", userId),
      Query.equal("isLibrary", true),
      Query.equal("archived", false),
      Query.limit(5000)
    ]);
  }

  static async getExerciseSection(id: string) {
    return databases.getDocument(databaseId, COLLECTIONS.exerciseSections, id);
  }

  static async getAllExerciseSections(userId: string) {
    const result = await databases.listDocuments(databaseId, COLLECTIONS.exerciseSections, [
      Query.equal("userId", userId),
      Query.limit(5000) // Appwrite max limit
    ]);
    // Filter out library sections (templates) so they don't appear in weekly views
    // Use explicit filter because old docs might not have isLibrary attribute
    const filteredDocs = result.documents.filter((doc: any) => !doc.isLibrary);
    return {
      documents: filteredDocs,
      total: filteredDocs.length
    };
  }

  static async getExerciseSectionsByWeek(startDate: string, endDate: string, userId: string) {
    const result = await databases.listDocuments(databaseId, COLLECTIONS.exerciseSections, [
      Query.greaterThanEqual("$createdAt", startDate),
      Query.lessThanEqual("$createdAt", endDate),
      Query.equal("userId", userId),
      Query.limit(5000) // Appwrite max limit
    ]);
    const filteredDocs = result.documents.filter((doc: any) => !doc.isLibrary);
    return {
      documents: filteredDocs,
      total: filteredDocs.length
    };
  }

  static async updateExerciseSection(id: string, data: Partial<{
    name: string;
    targetSets: number;
    archived: boolean;
  }>) {
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.targetSets !== undefined) updateData.targetSets = data.targetSets;
    if (data.archived !== undefined) updateData.archived = data.archived;

    return databases.updateDocument(databaseId, COLLECTIONS.exerciseSections, id, updateData);
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
    completed: boolean; // Add type definition
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
        completed: data.completed,
        userId: data.userId
      });
    } catch (err: any) {
      console.error("CREATE WORKOUT ERROR:", err?.message || err);
      throw err;
    }
  }

  static async getWorkout(userId: string) {
    return databases.listDocuments(databaseId, COLLECTIONS.workouts, [
      Query.equal("userId", userId),
      Query.limit(5000), // Appwrite max limit
      Query.orderDesc("date")
    ]);
  }

  static async getWorkoutsBySection(sectionId: string) {
    try {
      const result = await databases.listDocuments(
        databaseId,
        COLLECTIONS.workouts,
        [
          Query.equal("sectionId", sectionId),
          Query.limit(5000), // Appwrite max limit
          Query.orderDesc("date")
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
      console.log("DbHelper.getWorkoutsByWeek - Query:", { startDate, endDate, userId });
      const result = await databases.listDocuments(
        databaseId,
        COLLECTIONS.workouts,
        [
          Query.greaterThanEqual("date", startDate),
          Query.lessThanEqual("date", endDate),
          Query.equal("userId", userId),
          Query.limit(5000), // Appwrite max limit
          Query.orderDesc("date") // Get newest first
        ]
      );
      console.log("DbHelper.getWorkoutsByWeek - Results:", result.documents.length, "documents");
      if (result.documents.length > 0) {
        console.log("DbHelper.getWorkoutsByWeek - Sample dates:", result.documents.slice(0, 3).map(d => d.date));
      }

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

  static async updateWorkoutStatus(id: string, completed: boolean) {
    return databases.updateDocument(databaseId, COLLECTIONS.workouts, id, {
      completed: completed
    });
  }

  static async deleteWorkout(id: string) {
    return databases.deleteDocument(databaseId, COLLECTIONS.workouts, id);
  }

  // Migration: Fix workouts with null numeric values
  static async migrateNullWorkoutValues() {
    let hasMore = true;
    let cursor = null;
    let fixedCount = 0;

    while (hasMore) {
      const queries = [Query.limit(100)];
      if (cursor) {
        queries.push(Query.cursorAfter(cursor));
      }

      const result = await databases.listDocuments(databaseId, COLLECTIONS.workouts, queries);

      if (result.documents.length === 0) {
        hasMore = false;
        break;
      }

      for (const doc of result.documents) {
        const needsUpdate = doc.sets === null || doc.sets === undefined ||
          doc.reps === null || doc.reps === undefined ||
          doc.weight === null || doc.weight === undefined ||
          doc.unit === null || doc.unit === undefined;

        if (needsUpdate) {
          await databases.updateDocument(databaseId, COLLECTIONS.workouts, doc.$id, {
            sets: doc.sets ?? 0,
            reps: doc.reps ?? 0,
            weight: doc.weight ?? 0,
            unit: doc.unit || 'kg'
          });
          fixedCount++;
          console.log(`Fixed workout ${doc.$id}: sets=${doc.sets ?? 0}, reps=${doc.reps ?? 0}, weight=${doc.weight ?? 0}`);
        }
      }

      cursor = result.documents[result.documents.length - 1].$id;
      if (result.documents.length < 100) {
        hasMore = false;
      }
    }

    console.log(`Migration complete. Fixed ${fixedCount} workouts.`);
    return fixedCount;
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
