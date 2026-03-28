import type { IWorkoutRepository } from "../repositories/interfaces/IWorkoutRepository";
import type { ISectionRepository } from "../repositories/interfaces/ISectionRepository";
import type { IHabitRepository } from "../repositories/interfaces/IHabitRepository";

interface SectionProgress {
    section_id: string;
    section_name: string;
    completed_sets: number;
    target_sets: number;
    last_workout: string | null;
}

interface DashboardData {
    current_streak: number;
    total_completed_sets: number;
    total_target_sets: number;
    section_progress: SectionProgress[];
}

interface WeekVolume {
    week: string;
    total: number;
    [exerciseType: string]: string | number;
}

function camelToTitle(str: string): string {
    return str
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
}

function getWeekLabel(date: Date): string {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date);
    monday.setDate(diff);
    return `Week of ${monday.getDate()} ${monday.toLocaleString("en-US", { month: "short" })}`;
}

export class AnalyticsService {
    constructor(
        private readonly workoutRepo: IWorkoutRepository,
        private readonly sectionRepo: ISectionRepository,
        private readonly habitRepo: IHabitRepository,
    ) {}

    async getDashboard(userId: string): Promise<DashboardData> {
        const [sections, workouts, completions] = await Promise.all([
            this.sectionRepo.findAllByUser(userId),
            this.workoutRepo.findAllByUser(userId),
            this.habitRepo.findAllCompletions(userId),
        ]);

        // Calculate streak from completions
        let currentStreak = 0;
        if (completions.length > 0) {
            const dates = [...new Set(completions.map((c) => c.date.split("T")[0]))].sort().reverse();
            const today = new Date().toISOString().split("T")[0];
            let checkDate = today;

            for (const date of dates) {
                if (date === checkDate || date === getPreviousDay(checkDate)) {
                    currentStreak++;
                    checkDate = date;
                } else {
                    break;
                }
            }
        }

        // Section progress
        const sectionProgress: SectionProgress[] = sections.map((section) => {
            const sectionWorkouts = workouts.filter((w) => w.section_id === section.id);
            const completedSets = sectionWorkouts.reduce((sum, w) => sum + w.sets, 0);
            const lastWorkout = sectionWorkouts.length > 0
                ? sectionWorkouts.sort((a, b) => b.date.localeCompare(a.date))[0].date
                : null;

            return {
                section_id: section.id,
                section_name: section.name,
                completed_sets: completedSets,
                target_sets: section.target_sets,
                last_workout: lastWorkout,
            };
        });

        const totalCompletedSets = sectionProgress.reduce((sum, s) => sum + s.completed_sets, 0);
        const totalTargetSets = sectionProgress.reduce((sum, s) => sum + s.target_sets, 0);

        return {
            current_streak: currentStreak,
            total_completed_sets: totalCompletedSets,
            total_target_sets: totalTargetSets,
            section_progress: sectionProgress,
        };
    }

    async getProgress(userId: string): Promise<{ volume_data: WeekVolume[] }> {
        const workouts = await this.workoutRepo.findAllByUser(userId);

        // Group workouts by week
        const weekMap = new Map<string, { total: number; exercises: Map<string, number> }>();

        // Generate last 4 weeks
        const now = new Date();
        for (let i = 3; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i * 7);
            const label = getWeekLabel(d);
            if (!weekMap.has(label)) {
                weekMap.set(label, { total: 0, exercises: new Map() });
            }
        }

        for (const w of workouts) {
            const date = new Date(w.date);
            const label = getWeekLabel(date);
            if (!weekMap.has(label)) {
                weekMap.set(label, { total: 0, exercises: new Map() });
            }
            const week = weekMap.get(label)!;
            week.total += w.sets;

            // Convert exercise_type to camelCase key
            const key = w.exercise_type
                .toLowerCase()
                .replace(/\s+(.)/g, (_, c) => c.toUpperCase());
            week.exercises.set(key, (week.exercises.get(key) || 0) + w.sets);
        }

        const volumeData: WeekVolume[] = Array.from(weekMap.entries()).map(([week, data]) => {
            const entry: WeekVolume = { week, total: data.total };
            for (const [exercise, sets] of data.exercises) {
                entry[exercise] = sets;
            }
            return entry;
        });

        return { volume_data: volumeData };
    }
}

function getPreviousDay(dateStr: string): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
}
