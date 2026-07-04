import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AnalyticsService } from "./analytics.service";
import type { IWorkoutRepository } from "../repositories/interfaces/IWorkoutRepository";
import type { ISectionRepository } from "../repositories/interfaces/ISectionRepository";
import type { IHabitRepository } from "../repositories/interfaces/IHabitRepository";

function makeWorkoutRepo(): IWorkoutRepository {
    return {
        findAllByUser: vi.fn(),
        findBySectionId: vi.fn(),
        findByWeek: vi.fn(),
        create: vi.fn(),
        createBatch: vi.fn(),
        updateStatus: vi.fn(),
        delete: vi.fn(),
    };
}
function makeSectionRepo(): ISectionRepository {
    return {
        findAllByUser: vi.fn(),
        findByWeek: vi.fn(),
        findById: vi.fn(),
        findLibrary: vi.fn(),
        findActiveLibrary: vi.fn(),
        findByLibraryId: vi.fn(),
        create: vi.fn(),
        createLibrary: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };
}
function makeHabitRepo(): IHabitRepository {
    return {
        findAllByUser: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        findAllCompletions: vi.fn(),
        findCompletionsByHabit: vi.fn(),
        createCompletion: vi.fn(),
        deleteCompletion: vi.fn(),
    };
}

function completion(date: string) {
    return { id: `c-${date}`, user_id: "u1", habit_id: "h1", date, created_at: date };
}

describe("AnalyticsService", () => {
    let workoutRepo: IWorkoutRepository;
    let sectionRepo: ISectionRepository;
    let habitRepo: IHabitRepository;
    let service: AnalyticsService;

    beforeEach(() => {
        workoutRepo = makeWorkoutRepo();
        sectionRepo = makeSectionRepo();
        habitRepo = makeHabitRepo();
        service = new AnalyticsService(workoutRepo, sectionRepo, habitRepo);
        // Friday, 2026-07-03 — matches the "today" used across this session
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-07-03T12:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("getDashboard - streak calculation", () => {
        it("is 0 when there are no completions", async () => {
            (sectionRepo.findAllByUser as any).mockResolvedValue([]);
            (workoutRepo.findAllByUser as any).mockResolvedValue([]);
            (habitRepo.findAllCompletions as any).mockResolvedValue([]);

            const dashboard = await service.getDashboard("u1");
            expect(dashboard.current_streak).toBe(0);
        });

        it("counts consecutive days ending today", async () => {
            (sectionRepo.findAllByUser as any).mockResolvedValue([]);
            (workoutRepo.findAllByUser as any).mockResolvedValue([]);
            (habitRepo.findAllCompletions as any).mockResolvedValue([
                completion("2026-07-03T09:00:00.000Z"),
                completion("2026-07-02T09:00:00.000Z"),
                completion("2026-07-01T09:00:00.000Z"),
            ]);

            const dashboard = await service.getDashboard("u1");
            expect(dashboard.current_streak).toBe(3);
        });

        it("still counts a streak that ended yesterday (grace before today's check-in)", async () => {
            (sectionRepo.findAllByUser as any).mockResolvedValue([]);
            (workoutRepo.findAllByUser as any).mockResolvedValue([]);
            (habitRepo.findAllCompletions as any).mockResolvedValue([
                completion("2026-07-02T09:00:00.000Z"),
                completion("2026-07-01T09:00:00.000Z"),
            ]);

            const dashboard = await service.getDashboard("u1");
            expect(dashboard.current_streak).toBe(2);
        });

        it("stops counting at a gap in completion dates", async () => {
            (sectionRepo.findAllByUser as any).mockResolvedValue([]);
            (workoutRepo.findAllByUser as any).mockResolvedValue([]);
            (habitRepo.findAllCompletions as any).mockResolvedValue([
                completion("2026-07-03T09:00:00.000Z"),
                completion("2026-07-01T09:00:00.000Z"), // gap on 07-02
            ]);

            const dashboard = await service.getDashboard("u1");
            expect(dashboard.current_streak).toBe(1);
        });

        it("is 0 when the most recent completion is older than yesterday", async () => {
            (sectionRepo.findAllByUser as any).mockResolvedValue([]);
            (workoutRepo.findAllByUser as any).mockResolvedValue([]);
            (habitRepo.findAllCompletions as any).mockResolvedValue([
                completion("2026-06-01T09:00:00.000Z"),
            ]);

            const dashboard = await service.getDashboard("u1");
            expect(dashboard.current_streak).toBe(0);
        });

        it("dedupes multiple completions on the same day before counting the streak", async () => {
            (sectionRepo.findAllByUser as any).mockResolvedValue([]);
            (workoutRepo.findAllByUser as any).mockResolvedValue([]);
            (habitRepo.findAllCompletions as any).mockResolvedValue([
                completion("2026-07-03T09:00:00.000Z"),
                completion("2026-07-03T20:00:00.000Z"), // same day, different habit/time
            ]);

            const dashboard = await service.getDashboard("u1");
            expect(dashboard.current_streak).toBe(1);
        });
    });

    describe("getDashboard - section progress", () => {
        it("aggregates completed/target sets and finds the most recent workout per section", async () => {
            (sectionRepo.findAllByUser as any).mockResolvedValue([
                { id: "s1", name: "Push Day", target_sets: 10 },
                { id: "s2", name: "Pull Day", target_sets: 8 },
            ]);
            (workoutRepo.findAllByUser as any).mockResolvedValue([
                { id: "w1", section_id: "s1", sets: 3, date: "2026-07-01" },
                { id: "w2", section_id: "s1", sets: 4, date: "2026-07-02" },
                { id: "w3", section_id: "s2", sets: 5, date: "2026-06-30" },
            ]);
            (habitRepo.findAllCompletions as any).mockResolvedValue([]);

            const dashboard = await service.getDashboard("u1");

            expect(dashboard.section_progress).toEqual([
                { section_id: "s1", section_name: "Push Day", completed_sets: 7, target_sets: 10, last_workout: "2026-07-02" },
                { section_id: "s2", section_name: "Pull Day", completed_sets: 5, target_sets: 8, last_workout: "2026-06-30" },
            ]);
            expect(dashboard.total_completed_sets).toBe(12);
            expect(dashboard.total_target_sets).toBe(18);
        });

        it("reports null last_workout and 0 completed sets for a section with no workouts", async () => {
            (sectionRepo.findAllByUser as any).mockResolvedValue([{ id: "s1", name: "Legs", target_sets: 10 }]);
            (workoutRepo.findAllByUser as any).mockResolvedValue([]);
            (habitRepo.findAllCompletions as any).mockResolvedValue([]);

            const dashboard = await service.getDashboard("u1");

            expect(dashboard.section_progress).toEqual([
                { section_id: "s1", section_name: "Legs", completed_sets: 0, target_sets: 10, last_workout: null },
            ]);
        });
    });

    describe("getProgress - weekly volume", () => {
        it("always returns exactly 4 weeks even with no workouts", async () => {
            (workoutRepo.findAllByUser as any).mockResolvedValue([]);

            const { volume_data } = await service.getProgress("u1");

            expect(volume_data).toHaveLength(4);
            for (const week of volume_data) {
                expect(week.total).toBe(0);
            }
        });

        it("buckets a workout into this week and camelCases its exercise_type as a key", async () => {
            (workoutRepo.findAllByUser as any).mockResolvedValue([
                { id: "w1", exercise_type: "Incline Dumbbell Press", sets: 5, date: "2026-07-03T00:00:00.000Z" },
            ]);

            const { volume_data } = await service.getProgress("u1");

            const thisWeek = volume_data[volume_data.length - 1];
            expect(thisWeek.total).toBe(5);
            expect(thisWeek.inclineDumbbellPress).toBe(5);
        });

        it("sums sets for multiple workouts of the same exercise within a week", async () => {
            (workoutRepo.findAllByUser as any).mockResolvedValue([
                { id: "w1", exercise_type: "Squat", sets: 3, date: "2026-07-01T00:00:00.000Z" },
                { id: "w2", exercise_type: "Squat", sets: 4, date: "2026-07-02T00:00:00.000Z" },
            ]);

            const { volume_data } = await service.getProgress("u1");

            const thisWeek = volume_data[volume_data.length - 1];
            expect(thisWeek.total).toBe(7);
            expect(thisWeek.squat).toBe(7);
        });

        it("adds an extra week bucket for workouts older than the tracked 4-week window", async () => {
            (workoutRepo.findAllByUser as any).mockResolvedValue([
                { id: "w1", exercise_type: "Deadlift", sets: 2, date: "2020-01-01T00:00:00.000Z" },
            ]);

            const { volume_data } = await service.getProgress("u1");

            expect(volume_data.length).toBeGreaterThan(4);
            const oldWeek = volume_data.find((w) => w.deadlift === 2);
            expect(oldWeek).toBeDefined();
        });
    });
});
