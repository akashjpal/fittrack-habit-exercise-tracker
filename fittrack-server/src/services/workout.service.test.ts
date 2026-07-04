import { describe, it, expect, vi, beforeEach } from "vitest";
import { WorkoutService } from "./workout.service";
import type { IWorkoutRepository } from "../repositories/interfaces/IWorkoutRepository";
import type { WorkoutRow } from "../shared/index";

function makeRow(overrides: Partial<WorkoutRow> = {}): WorkoutRow {
    return {
        id: "w1",
        user_id: "u1",
        section_id: "s1",
        exercise_type: "Squat",
        sets: 3,
        reps: 10,
        weight: 50,
        unit: "kg",
        completed: true,
        date: "2026-07-01",
        created_at: "2026-07-01T00:00:00.000Z",
        updated_at: "2026-07-01T00:00:00.000Z",
        ...overrides,
    };
}

function makeRepo(): IWorkoutRepository {
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

describe("WorkoutService", () => {
    let repo: IWorkoutRepository;
    let service: WorkoutService;

    beforeEach(() => {
        repo = makeRepo();
        service = new WorkoutService(repo);
    });

    it("getAllWorkouts delegates to repo.findAllByUser with the given userId", async () => {
        const rows = [makeRow()];
        (repo.findAllByUser as any).mockResolvedValue(rows);

        const result = await service.getAllWorkouts("u1");

        expect(repo.findAllByUser).toHaveBeenCalledWith("u1");
        expect(result).toBe(rows);
    });

    it("getWorkoutsBySection delegates to repo.findBySectionId", async () => {
        const rows = [makeRow({ section_id: "s2" })];
        (repo.findBySectionId as any).mockResolvedValue(rows);

        const result = await service.getWorkoutsBySection("s2");

        expect(repo.findBySectionId).toHaveBeenCalledWith("s2");
        expect(result).toBe(rows);
    });

    it("getWorkoutsByWeek forwards userId/startDate/endDate in order", async () => {
        (repo.findByWeek as any).mockResolvedValue([]);

        await service.getWorkoutsByWeek("u1", "2026-06-29", "2026-07-05");

        expect(repo.findByWeek).toHaveBeenCalledWith("u1", "2026-06-29", "2026-07-05");
    });

    it("createWorkout passes userId and dto through to the repo", async () => {
        const dto = { section_id: "s1", exercise_type: "Bench", sets: 3, reps: 8, weight: 40, unit: "kg", completed: true, date: "2026-07-01" };
        const created = makeRow(dto);
        (repo.create as any).mockResolvedValue(created);

        const result = await service.createWorkout("u1", dto as any);

        expect(repo.create).toHaveBeenCalledWith("u1", dto);
        expect(result).toBe(created);
    });

    it("createBatchWorkouts forwards userId, sectionId, and the workouts array", async () => {
        const workouts = [{ exercise_type: "Row", sets: 3, reps: 10, weight: 20, unit: "kg", completed: true }];
        (repo.createBatch as any).mockResolvedValue([makeRow()]);

        await service.createBatchWorkouts("u1", "s9", workouts as any);

        expect(repo.createBatch).toHaveBeenCalledWith("u1", "s9", workouts);
    });

    it("toggleWorkoutStatus forwards id and the new completed flag", async () => {
        const updated = makeRow({ completed: false });
        (repo.updateStatus as any).mockResolvedValue(updated);

        const result = await service.toggleWorkoutStatus("w1", false);

        expect(repo.updateStatus).toHaveBeenCalledWith("w1", false);
        expect(result).toBe(updated);
    });

    it("deleteWorkout forwards the id to the repo and resolves with no value", async () => {
        (repo.delete as any).mockResolvedValue(undefined);

        await expect(service.deleteWorkout("w1")).resolves.toBeUndefined();
        expect(repo.delete).toHaveBeenCalledWith("w1");
    });

    it("propagates repo rejections instead of swallowing them", async () => {
        (repo.findAllByUser as any).mockRejectedValue(new Error("db down"));

        await expect(service.getAllWorkouts("u1")).rejects.toThrow("db down");
    });
});
