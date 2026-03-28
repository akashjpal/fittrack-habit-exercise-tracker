import type { HabitRow, CreateHabitDto, HabitCompletionRow, CreateCompletionDto } from "@fittrack/shared";

export interface IHabitRepository {
    findAllByUser(userId: string): Promise<HabitRow[]>;
    create(userId: string, dto: CreateHabitDto): Promise<HabitRow>;
    delete(id: string): Promise<void>;
    findAllCompletions(userId: string): Promise<HabitCompletionRow[]>;
    findCompletionsByHabit(habitId: string): Promise<HabitCompletionRow[]>;
    createCompletion(userId: string, dto: CreateCompletionDto): Promise<HabitCompletionRow>;
    deleteCompletion(habitId: string, date: string): Promise<void>;
}
