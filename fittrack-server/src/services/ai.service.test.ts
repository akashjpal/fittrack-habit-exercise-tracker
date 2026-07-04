import { describe, it, expect, vi, beforeEach } from "vitest";
import { AIService } from "./ai.service";
import type { IWorkoutRepository } from "../repositories/interfaces/IWorkoutRepository";
import type { ISectionRepository } from "../repositories/interfaces/ISectionRepository";
import type { IHabitRepository } from "../repositories/interfaces/IHabitRepository";
import { AppError } from "../utils/errors";

// The .env GROQ_API_KEY committed in this repo starts with "gsk_zFQ", which
// AIService treats as a known placeholder and always routes through its
// deterministic fallback/simulation branch - so these tests never hit the
// network, matching how the service already behaves in this checkout.

function makeWorkoutRepo(): IWorkoutRepository {
    return {
        findAllByUser: vi.fn().mockResolvedValue([]),
        findBySectionId: vi.fn().mockResolvedValue([]),
        findByWeek: vi.fn(),
        create: vi.fn(),
        createBatch: vi.fn().mockResolvedValue([]),
        updateStatus: vi.fn(),
        delete: vi.fn(),
    };
}
function makeSectionRepo(): ISectionRepository {
    return {
        findAllByUser: vi.fn().mockResolvedValue([]),
        findByWeek: vi.fn(),
        findById: vi.fn(),
        findLibrary: vi.fn(),
        findActiveLibrary: vi.fn(),
        findByLibraryId: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
        createLibrary: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };
}
function makeHabitRepo(): IHabitRepository {
    return {
        findAllByUser: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
        delete: vi.fn(),
        findAllCompletions: vi.fn().mockResolvedValue([]),
        findCompletionsByHabit: vi.fn(),
        createCompletion: vi.fn(),
        deleteCompletion: vi.fn(),
    };
}

describe("AIService (simulation/fallback mode)", () => {
    let workoutRepo: IWorkoutRepository;
    let sectionRepo: ISectionRepository;
    let habitRepo: IHabitRepository;
    let service: AIService;

    beforeEach(() => {
        workoutRepo = makeWorkoutRepo();
        sectionRepo = makeSectionRepo();
        habitRepo = makeHabitRepo();
        service = new AIService(workoutRepo, sectionRepo, habitRepo);
    });

    it("fitCheck returns the simulated motivational report shape", async () => {
        const result = await service.fitCheck("u1");

        expect(typeof result.motivation).toBe("string");
        expect(result.strengths).toBeInstanceOf(Array);
        expect(result.weaknesses).toBeInstanceOf(Array);
        expect(result.solutions).toBeInstanceOf(Array);
        expect(result.strengths.length).toBeGreaterThan(0);
    });

    it("generateWorkout returns a workout with exercises", async () => {
        const result = await service.generateWorkout("full body strength");

        expect(result.workout_name).toBeTruthy();
        expect(result.exercises.length).toBeGreaterThan(0);
        for (const ex of result.exercises) {
            expect(ex).toHaveProperty("name");
            expect(ex).toHaveProperty("sets");
            expect(ex).toHaveProperty("reps");
        }
    });

    it("generateHabits returns habits with valid daily/weekly frequency", async () => {
        const result = await service.generateHabits("healthier mornings");

        expect(result.habits.length).toBeGreaterThan(0);
        for (const h of result.habits) {
            expect(["daily", "weekly"]).toContain(h.frequency);
        }
    });

    it("analyzeHabits returns a free-text analysis string", async () => {
        const result = await service.analyzeHabits(["Meditate"], ["Stretch"]);
        expect(typeof result.analysis).toBe("string");
        expect(result.analysis.length).toBeGreaterThan(0);
    });

    describe("processVoiceLog", () => {
        it("falls back to a default transcript, persists parsed workouts, and returns them", async () => {
            const saved = [{ id: "w1", exercise_type: "Incline Dumbbell Press" }];
            (workoutRepo.createBatch as any).mockResolvedValue(saved);

            const result = await service.processVoiceLog(
                "/nonexistent/audio.webm", // never touched: the invalid-key check short-circuits before fs access
                "audio/webm",
                "u1",
                "s1",
                "2026-07-03T00:00:00.000Z",
            );

            expect(workoutRepo.createBatch).toHaveBeenCalledWith(
                "u1",
                "s1",
                [
                    {
                        exercise_type: "Incline Dumbbell Press",
                        sets: 3,
                        reps: 12,
                        weight: 35,
                        unit: "kg",
                        completed: true,
                        date: "2026-07-03T00:00:00.000Z",
                    },
                ],
            );
            expect(result.workouts).toBe(saved);
        });
    });

    describe("detectPlateauForLibrary / detectPlateau", () => {
        it("short-circuits with no sections for the library", async () => {
            (sectionRepo.findByLibraryId as any).mockResolvedValue([]);

            const result = await service.detectPlateauForLibrary("u1", "lib1");

            expect(result.plateauDetected).toBe(false);
            expect(result.exercises).toEqual([]);
            expect(workoutRepo.findBySectionId).not.toHaveBeenCalled();
        });

        it("reports insufficient data when fewer than 3 workouts exist across all section instances", async () => {
            (sectionRepo.findByLibraryId as any).mockResolvedValue([{ id: "s1" }]);
            (workoutRepo.findBySectionId as any).mockResolvedValue([
                { exercise_type: "Squat", sets: 3, reps: 5, weight: 100, unit: "kg", date: "2026-07-01" },
            ]);

            const result = await service.detectPlateauForLibrary("u1", "lib1");

            expect(result.plateauDetected).toBe(false);
            expect(result.summary).toMatch(/not enough/i);
        });

        it("runs the simulated plateau analysis once there are at least 3 workouts", async () => {
            (sectionRepo.findByLibraryId as any).mockResolvedValue([{ id: "s1" }, { id: "s2" }]);
            (workoutRepo.findBySectionId as any)
                .mockResolvedValueOnce([
                    { exercise_type: "Squat", sets: 3, reps: 5, weight: 100, unit: "kg", date: "2026-06-01" },
                    { exercise_type: "Squat", sets: 3, reps: 5, weight: 100, unit: "kg", date: "2026-06-15" },
                ])
                .mockResolvedValueOnce([
                    { exercise_type: "Squat", sets: 3, reps: 5, weight: 105, unit: "kg", date: "2026-07-01" },
                ]);

            const result = await service.detectPlateauForLibrary("u1", "lib1");

            expect(typeof result.plateauDetected).toBe("boolean");
            expect(result.exercises.length).toBeGreaterThan(0);
            expect(result.recommendations.length).toBeGreaterThan(0);
        });

        it("detectPlateau reports insufficient data below the 3-workout threshold without needing sections", async () => {
            const result = await service.detectPlateau([
                { exercise_type: "Row", sets: 3, reps: 10, weight: 20, unit: "kg", date: "2026-07-01" },
            ]);
            expect(result.plateauDetected).toBe(false);
            expect(result.recommendations.length).toBeGreaterThan(0);
        });
    });
});
