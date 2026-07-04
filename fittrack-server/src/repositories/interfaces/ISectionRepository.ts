import type { ExerciseSectionRow, CreateSectionDto, UpdateSectionDto } from "../../shared/index";

export interface ISectionRepository {
    findAllByUser(userId: string): Promise<ExerciseSectionRow[]>;
    findByWeek(userId: string, startDate: string, endDate: string): Promise<ExerciseSectionRow[]>;
    findById(id: string): Promise<ExerciseSectionRow>;
    findLibrary(userId: string): Promise<ExerciseSectionRow[]>;
    findActiveLibrary(userId: string): Promise<ExerciseSectionRow[]>;
    findByLibraryId(libraryId: string): Promise<ExerciseSectionRow[]>;
    create(userId: string, dto: CreateSectionDto): Promise<ExerciseSectionRow>;
    createLibrary(userId: string, name: string): Promise<ExerciseSectionRow>;
    update(id: string, dto: UpdateSectionDto): Promise<ExerciseSectionRow>;
    delete(id: string): Promise<void>;
}
