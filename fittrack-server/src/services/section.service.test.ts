import { describe, it, expect, vi, beforeEach } from "vitest";
import { SectionService } from "./section.service";
import type { ISectionRepository } from "../repositories/interfaces/ISectionRepository";

function makeRepo(): ISectionRepository {
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

describe("SectionService", () => {
    let repo: ISectionRepository;
    let service: SectionService;

    beforeEach(() => {
        repo = makeRepo();
        service = new SectionService(repo);
    });

    it("getAllSections delegates to repo.findAllByUser", async () => {
        const rows = [{ id: "s1" }];
        (repo.findAllByUser as any).mockResolvedValue(rows);
        expect(await service.getAllSections("u1")).toBe(rows);
        expect(repo.findAllByUser).toHaveBeenCalledWith("u1");
    });

    it("getSectionsByWeek forwards all three arguments in order", async () => {
        (repo.findByWeek as any).mockResolvedValue([]);
        await service.getSectionsByWeek("u1", "2026-06-29", "2026-07-05");
        expect(repo.findByWeek).toHaveBeenCalledWith("u1", "2026-06-29", "2026-07-05");
    });

    it("getSectionById delegates to repo.findById", async () => {
        const row = { id: "s1" };
        (repo.findById as any).mockResolvedValue(row);
        expect(await service.getSectionById("s1")).toBe(row);
        expect(repo.findById).toHaveBeenCalledWith("s1");
    });

    it("getLibrary delegates to repo.findLibrary", async () => {
        const rows = [{ id: "s1", is_library: true }];
        (repo.findLibrary as any).mockResolvedValue(rows);
        expect(await service.getLibrary("u1")).toBe(rows);
        expect(repo.findLibrary).toHaveBeenCalledWith("u1");
    });

    it("getActiveLibrary delegates to repo.findActiveLibrary", async () => {
        const rows = [{ id: "s1" }];
        (repo.findActiveLibrary as any).mockResolvedValue(rows);
        expect(await service.getActiveLibrary("u1")).toBe(rows);
        expect(repo.findActiveLibrary).toHaveBeenCalledWith("u1");
    });

    it("getSectionsByLibraryId delegates to repo.findByLibraryId", async () => {
        const rows = [{ id: "s1" }];
        (repo.findByLibraryId as any).mockResolvedValue(rows);
        expect(await service.getSectionsByLibraryId("lib1")).toBe(rows);
        expect(repo.findByLibraryId).toHaveBeenCalledWith("lib1");
    });

    it("createSection forwards userId and dto", async () => {
        const dto = { name: "Push Day", target_sets: 12, date: "2026-07-01" };
        const created = { id: "s1", ...dto };
        (repo.create as any).mockResolvedValue(created);
        expect(await service.createSection("u1", dto as any)).toBe(created);
        expect(repo.create).toHaveBeenCalledWith("u1", dto);
    });

    it("createLibrarySection forwards userId and name", async () => {
        const created = { id: "s1", name: "Push Day", is_library: true };
        (repo.createLibrary as any).mockResolvedValue(created);
        expect(await service.createLibrarySection("u1", "Push Day")).toBe(created);
        expect(repo.createLibrary).toHaveBeenCalledWith("u1", "Push Day");
    });

    it("updateSection forwards id and partial dto", async () => {
        const dto = { name: "Updated" };
        const updated = { id: "s1", name: "Updated" };
        (repo.update as any).mockResolvedValue(updated);
        expect(await service.updateSection("s1", dto)).toBe(updated);
        expect(repo.update).toHaveBeenCalledWith("s1", dto);
    });

    it("deleteSection forwards the id", async () => {
        await service.deleteSection("s1");
        expect(repo.delete).toHaveBeenCalledWith("s1");
    });
});
