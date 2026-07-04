import type { IHabitRepository } from "../interfaces/IHabitRepository";
import type { HabitRow, CreateHabitDto, HabitCompletionRow, CreateCompletionDto } from "../../shared/index";
import { insforgeAdmin } from "../../config/insforge";
import { AppError } from "../../utils/errors";

export class InsForgeHabitRepository implements IHabitRepository {
    private readonly habitTable = "habits";
    private readonly completionTable = "habit_completions";

    async findAllByUser(userId: string): Promise<HabitRow[]> {
        const { data, error } = await insforgeAdmin.database
            .from(this.habitTable)
            .select()
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw AppError.internal(error.message);
        return data as HabitRow[];
    }

    async create(userId: string, dto: CreateHabitDto): Promise<HabitRow> {
        const { data, error } = await insforgeAdmin.database
            .from(this.habitTable)
            .insert([{
                user_id: userId,
                name: dto.name,
                frequency: dto.frequency,
            }])
            .select()
            .single();

        if (error) throw AppError.internal(error.message);
        return data as HabitRow;
    }

    async delete(id: string): Promise<void> {
        const { error } = await insforgeAdmin.database
            .from(this.habitTable)
            .delete()
            .eq("id", id);

        if (error) throw AppError.internal(error.message);
    }

    async findAllCompletions(userId: string): Promise<HabitCompletionRow[]> {
        const { data, error } = await insforgeAdmin.database
            .from(this.completionTable)
            .select()
            .eq("user_id", userId)
            .order("date", { ascending: false });

        if (error) throw AppError.internal(error.message);
        return data as HabitCompletionRow[];
    }

    async findCompletionsByHabit(habitId: string): Promise<HabitCompletionRow[]> {
        const { data, error } = await insforgeAdmin.database
            .from(this.completionTable)
            .select()
            .eq("habit_id", habitId)
            .order("date", { ascending: false });

        if (error) throw AppError.internal(error.message);
        return data as HabitCompletionRow[];
    }

    async createCompletion(userId: string, dto: CreateCompletionDto): Promise<HabitCompletionRow> {
        const { data, error } = await insforgeAdmin.database
            .from(this.completionTable)
            .insert([{
                user_id: userId,
                habit_id: dto.habit_id,
                date: dto.date,
            }])
            .select()
            .single();

        if (error) throw AppError.internal(error.message);
        return data as HabitCompletionRow;
    }

    async deleteCompletion(habitId: string, date: string): Promise<void> {
        const { error } = await insforgeAdmin.database
            .from(this.completionTable)
            .delete()
            .eq("habit_id", habitId)
            .eq("date", date);

        if (error) throw AppError.internal(error.message);
    }
}
