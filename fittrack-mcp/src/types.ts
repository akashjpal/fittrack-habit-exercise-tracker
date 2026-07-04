export interface ExerciseSection {
    id: string;
    userId: string;
    name: string;
    targetSets: number;
    date: string;
    isLibrary: boolean;
    archived: boolean;
    librarySectionId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Workout {
    id: string;
    userId: string;
    sectionId: string;
    exerciseType: string;
    sets: number;
    reps: number;
    weight: number;
    unit: string;
    completed: boolean;
    date: string;
    createdAt: string;
    updatedAt: string;
}

export interface Habit {
    id: string;
    userId: string;
    name: string;
    frequency: "daily" | "weekly";
    createdAt: string;
    updatedAt: string;
}

export interface HabitCompletion {
    id: string;
    userId: string;
    habitId: string;
    date: string;
    createdAt: string;
}

export interface DashboardData {
    currentStreak: number;
    totalCompletedSets: number;
    totalTargetSets: number;
    sectionProgress: {
        sectionId: string;
        sectionName: string;
        completedSets: number;
        targetSets: number;
        lastWorkout: string | null;
    }[];
}

export interface ProgressData {
    volumeData: Record<string, string | number>[];
}
