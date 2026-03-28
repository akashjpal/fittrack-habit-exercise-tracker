import type { WorkoutRow, CreateWorkoutDto } from "@fittrack/shared";

export interface IWorkoutRepository {
    findAllByUser(userId: string): Promise<WorkoutRow[]>;
    findBySectionId(sectionId: string): Promise<WorkoutRow[]>;
    findByWeek(userId: string, startDate: string, endDate: string): Promise<WorkoutRow[]>;
    create(userId: string, dto: CreateWorkoutDto): Promise<WorkoutRow>;
    createBatch(userId: string, sectionId: string, workouts: Omit<CreateWorkoutDto, "section_id">[]): Promise<WorkoutRow[]>;
    updateStatus(id: string, completed: boolean): Promise<WorkoutRow>;
    delete(id: string): Promise<void>;
}
