import { describe, it, expect, vi, beforeEach } from "vitest";
import { HabitService } from "./habit.service";
import type { IHabitRepository } from "../repositories/interfaces/IHabitRepository";

function makeRepo(): IHabitRepository {
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

describe("HabitService", () => {
    let repo: IHabitRepository;
    let service: HabitService;

    beforeEach(() => {
        repo = makeRepo();
        service = new HabitService(repo);
    });

    it("getAllHabits delegates to repo.findAllByUser", async () => {
        const habits = [{ id: "h1" }];
        (repo.findAllByUser as any).mockResolvedValue(habits);

        const result = await service.getAllHabits("u1");

        expect(repo.findAllByUser).toHaveBeenCalledWith("u1");
        expect(result).toBe(habits);
    });

    it("createHabit forwards userId and dto", async () => {
        const dto = { name: "Meditate", frequency: "daily" as const };
        const created = { id: "h1", ...dto };
        (repo.create as any).mockResolvedValue(created);

        const result = await service.createHabit("u1", dto);

        expect(repo.create).toHaveBeenCalledWith("u1", dto);
        expect(result).toBe(created);
    });

    it("deleteHabit forwards the habit id", async () => {
        await service.deleteHabit("h1");
        expect(repo.delete).toHaveBeenCalledWith("h1");
    });

    it("getAllCompletions delegates to repo.findAllCompletions", async () => {
        const completions = [{ id: "c1" }];
        (repo.findAllCompletions as any).mockResolvedValue(completions);

        const result = await service.getAllCompletions("u1");

        expect(repo.findAllCompletions).toHaveBeenCalledWith("u1");
        expect(result).toBe(completions);
    });

    it("getCompletionsByHabit delegates to repo.findCompletionsByHabit", async () => {
        const completions = [{ id: "c1" }];
        (repo.findCompletionsByHabit as any).mockResolvedValue(completions);

        const result = await service.getCompletionsByHabit("h1");

        expect(repo.findCompletionsByHabit).toHaveBeenCalledWith("h1");
        expect(result).toBe(completions);
    });

    it("createCompletion forwards userId and dto", async () => {
        const dto = { habit_id: "h1", date: "2026-07-01T00:00:00.000Z" };
        const created = { id: "c1", ...dto };
        (repo.createCompletion as any).mockResolvedValue(created);

        const result = await service.createCompletion("u1", dto);

        expect(repo.createCompletion).toHaveBeenCalledWith("u1", dto);
        expect(result).toBe(created);
    });

    it("deleteCompletion forwards habitId and date", async () => {
        await service.deleteCompletion("h1", "2026-07-01T00:00:00.000Z");
        expect(repo.deleteCompletion).toHaveBeenCalledWith("h1", "2026-07-01T00:00:00.000Z");
    });
});
