import type { IHabitRepository } from "../repositories/interfaces/IHabitRepository";
import type { HabitRow, CreateHabitDto, HabitCompletionRow, CreateCompletionDto } from "../shared/index";

export class HabitService {
    constructor(private readonly habitRepo: IHabitRepository) { }

    async getAllHabits(userId: string): Promise<HabitRow[]> {
        return this.habitRepo.findAllByUser(userId);
    }

    async createHabit(userId: string, dto: CreateHabitDto): Promise<HabitRow> {
        return this.habitRepo.create(userId, dto);
    }

    async deleteHabit(id: string): Promise<void> {
        return this.habitRepo.delete(id);
    }

    async getAllCompletions(userId: string): Promise<HabitCompletionRow[]> {
        return this.habitRepo.findAllCompletions(userId);
    }

    async getCompletionsByHabit(habitId: string): Promise<HabitCompletionRow[]> {
        return this.habitRepo.findCompletionsByHabit(habitId);
    }

    async createCompletion(userId: string, dto: CreateCompletionDto): Promise<HabitCompletionRow> {
        return this.habitRepo.createCompletion(userId, dto);
    }

    async deleteCompletion(habitId: string, date: string): Promise<void> {
        return this.habitRepo.deleteCompletion(habitId, date);
    }
}
