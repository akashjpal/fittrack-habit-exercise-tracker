import type { ISectionRepository } from "../interfaces/ISectionRepository";
import type { ExerciseSectionRow, CreateSectionDto, UpdateSectionDto } from "@fittrack/shared";
import { insforgeAdmin } from "../../config/insforge";
import { AppError } from "../../utils/errors";

export class InsForgeSectionRepository implements ISectionRepository {
    private readonly table = "exercise_sections";

    async findAllByUser(userId: string): Promise<ExerciseSectionRow[]> {
        const { data, error } = await insforgeAdmin.database
            .from(this.table)
            .select()
            .eq("user_id", userId)
            .eq("archived", false)
            .order("date", { ascending: false });

        if (error) throw AppError.internal(error.message);
        return data as ExerciseSectionRow[];
    }

    async findByWeek(userId: string, startDate: string, endDate: string): Promise<ExerciseSectionRow[]> {
        const { data, error } = await insforgeAdmin.database
            .from(this.table)
            .select()
            .eq("user_id", userId)
            .gte("date", startDate)
            .lte("date", endDate)
            .eq("archived", false)
            .order("date", { ascending: false });

        if (error) throw AppError.internal(error.message);
        return data as ExerciseSectionRow[];
    }

    async findById(id: string): Promise<ExerciseSectionRow> {
        const { data, error } = await insforgeAdmin.database
            .from(this.table)
            .select()
            .eq("id", id)
            .single();

        if (error) throw AppError.notFound("Section not found");
        return data as ExerciseSectionRow;
    }

    async findLibrary(userId: string): Promise<ExerciseSectionRow[]> {
        const { data, error } = await insforgeAdmin.database
            .from(this.table)
            .select()
            .eq("user_id", userId)
            .eq("is_library", true)
            .order("name", { ascending: true });

        if (error) throw AppError.internal(error.message);
        return data as ExerciseSectionRow[];
    }

    async findActiveLibrary(userId: string): Promise<ExerciseSectionRow[]> {
        const { data, error } = await insforgeAdmin.database
            .from(this.table)
            .select()
            .eq("user_id", userId)
            .eq("is_library", true)
            .eq("archived", false)
            .order("name", { ascending: true });

        if (error) throw AppError.internal(error.message);
        return data as ExerciseSectionRow[];
    }

    async create(userId: string, dto: CreateSectionDto): Promise<ExerciseSectionRow> {
        const { data, error } = await insforgeAdmin.database
            .from(this.table)
            .insert([{
                user_id: userId,
                name: dto.name,
                target_sets: dto.target_sets ?? 10,
                date: dto.date,
                is_library: dto.is_library ?? false,
                library_section_id: dto.library_section_id ?? null,
            }])
            .select()
            .single();

        if (error) throw AppError.internal(error.message);
        return data as ExerciseSectionRow;
    }

    async createLibrary(userId: string, name: string): Promise<ExerciseSectionRow> {
        const { data, error } = await insforgeAdmin.database
            .from(this.table)
            .insert([{
                user_id: userId,
                name,
                target_sets: 10,
                date: new Date().toISOString(),
                is_library: true,
            }])
            .select()
            .single();

        if (error) throw AppError.internal(error.message);
        return data as ExerciseSectionRow;
    }

    async update(id: string, dto: UpdateSectionDto): Promise<ExerciseSectionRow> {
        const updateData: Record<string, unknown> = {};
        if (dto.name !== undefined) updateData.name = dto.name;
        if (dto.target_sets !== undefined) updateData.target_sets = dto.target_sets;
        if (dto.archived !== undefined) updateData.archived = dto.archived;

        const { data, error } = await insforgeAdmin.database
            .from(this.table)
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw AppError.internal(error.message);
        return data as ExerciseSectionRow;
    }

    async delete(id: string): Promise<void> {
        const { error } = await insforgeAdmin.database
            .from(this.table)
            .delete()
            .eq("id", id);

        if (error) throw AppError.internal(error.message);
    }
}
