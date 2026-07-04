import type { IWorkoutRepository } from "../interfaces/IWorkoutRepository";
import type { WorkoutRow, CreateWorkoutDto } from "../../shared/index";
import { insforgeAdmin } from "../../config/insforge";
import { AppError } from "../../utils/errors";

export class InsForgeWorkoutRepository implements IWorkoutRepository {
    private readonly table = "workouts";

    async findAllByUser(userId: string): Promise<WorkoutRow[]> {
        const { data, error } = await insforgeAdmin.database
            .from(this.table)
            .select()
            .eq("user_id", userId)
            .order("date", { ascending: false });

        if (error) throw AppError.internal(error.message);
        return data as WorkoutRow[];
    }

    async findBySectionId(sectionId: string): Promise<WorkoutRow[]> {
        const { data, error } = await insforgeAdmin.database
            .from(this.table)
            .select()
            .eq("section_id", sectionId)
            .order("date", { ascending: false });

        if (error) throw AppError.internal(error.message);
        return data as WorkoutRow[];
    }

    async findByWeek(userId: string, startDate: string, endDate: string): Promise<WorkoutRow[]> {
        const { data, error } = await insforgeAdmin.database
            .from(this.table)
            .select()
            .eq("user_id", userId)
            .gte("date", startDate)
            .lte("date", endDate)
            .order("date", { ascending: false });

        if (error) throw AppError.internal(error.message);
        return data as WorkoutRow[];
    }

    async create(userId: string, dto: CreateWorkoutDto): Promise<WorkoutRow> {
        const { data, error } = await insforgeAdmin.database
            .from(this.table)
            .insert([{
                user_id: userId,
                section_id: dto.section_id,
                exercise_type: dto.exercise_type,
                sets: dto.sets,
                reps: dto.reps,
                weight: dto.weight ?? 0,
                unit: dto.unit ?? "kg",
                completed: dto.completed ?? true,
                date: dto.date ?? new Date().toISOString(),
            }])
            .select()
            .single();

        if (error) throw AppError.internal(error.message);
        return data as WorkoutRow;
    }

    async createBatch(
        userId: string,
        sectionId: string,
        workouts: Omit<CreateWorkoutDto, "section_id">[],
    ): Promise<WorkoutRow[]> {
        const now = new Date().toISOString();
        const rows = workouts.map((w) => ({
            user_id: userId,
            section_id: sectionId,
            exercise_type: w.exercise_type,
            sets: w.sets,
            reps: w.reps,
            weight: w.weight ?? 0,
            unit: w.unit ?? "kg",
            completed: w.completed ?? true,
            date: w.date ?? now,
        }));

        const { data, error } = await insforgeAdmin.database
            .from(this.table)
            .insert(rows)
            .select();

        if (error) throw AppError.internal(error.message);
        return data as WorkoutRow[];
    }

    async updateStatus(id: string, completed: boolean): Promise<WorkoutRow> {
        const { data, error } = await insforgeAdmin.database
            .from(this.table)
            .update({ completed })
            .eq("id", id)
            .select()
            .single();

        if (error) throw AppError.internal(error.message);
        return data as WorkoutRow;
    }

    async delete(id: string): Promise<void> {
        const { error } = await insforgeAdmin.database
            .from(this.table)
            .delete()
            .eq("id", id);

        if (error) throw AppError.internal(error.message);
    }
}
