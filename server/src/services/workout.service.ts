import type { IWorkoutRepository } from "../repositories/interfaces/IWorkoutRepository";
import type { WorkoutRow, CreateWorkoutDto } from "@fittrack/shared";

export class WorkoutService {
    constructor(private readonly workoutRepo: IWorkoutRepository) {}

    async getAllWorkouts(userId: string): Promise<WorkoutRow[]> {
        return this.workoutRepo.findAllByUser(userId);
    }

    async getWorkoutsBySection(sectionId: string): Promise<WorkoutRow[]> {
        return this.workoutRepo.findBySectionId(sectionId);
    }

    async getWorkoutsByWeek(userId: string, startDate: string, endDate: string): Promise<WorkoutRow[]> {
        return this.workoutRepo.findByWeek(userId, startDate, endDate);
    }

    async createWorkout(userId: string, dto: CreateWorkoutDto): Promise<WorkoutRow> {
        return this.workoutRepo.create(userId, dto);
    }

    async createBatchWorkouts(
        userId: string,
        sectionId: string,
        workouts: Omit<CreateWorkoutDto, "section_id">[],
    ): Promise<WorkoutRow[]> {
        return this.workoutRepo.createBatch(userId, sectionId, workouts);
    }

    async toggleWorkoutStatus(id: string, completed: boolean): Promise<WorkoutRow> {
        return this.workoutRepo.updateStatus(id, completed);
    }

    async deleteWorkout(id: string): Promise<void> {
        return this.workoutRepo.delete(id);
    }
}
