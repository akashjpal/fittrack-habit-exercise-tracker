import type { ISectionRepository } from "../repositories/interfaces/ISectionRepository";
import type { ExerciseSectionRow, CreateSectionDto, UpdateSectionDto } from "@fittrack/shared";

export class SectionService {
    constructor(private readonly sectionRepo: ISectionRepository) {}

    async getAllSections(userId: string): Promise<ExerciseSectionRow[]> {
        return this.sectionRepo.findAllByUser(userId);
    }

    async getSectionsByWeek(userId: string, startDate: string, endDate: string): Promise<ExerciseSectionRow[]> {
        return this.sectionRepo.findByWeek(userId, startDate, endDate);
    }

    async getSectionById(id: string): Promise<ExerciseSectionRow> {
        return this.sectionRepo.findById(id);
    }

    async getLibrary(userId: string): Promise<ExerciseSectionRow[]> {
        return this.sectionRepo.findLibrary(userId);
    }

    async getActiveLibrary(userId: string): Promise<ExerciseSectionRow[]> {
        return this.sectionRepo.findActiveLibrary(userId);
    }

    async createSection(userId: string, dto: CreateSectionDto): Promise<ExerciseSectionRow> {
        return this.sectionRepo.create(userId, dto);
    }

    async createLibrarySection(userId: string, name: string): Promise<ExerciseSectionRow> {
        return this.sectionRepo.createLibrary(userId, name);
    }

    async updateSection(id: string, dto: UpdateSectionDto): Promise<ExerciseSectionRow> {
        return this.sectionRepo.update(id, dto);
    }

    async deleteSection(id: string): Promise<void> {
        return this.sectionRepo.delete(id);
    }
}
