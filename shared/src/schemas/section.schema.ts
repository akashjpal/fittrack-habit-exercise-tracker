import { z } from "zod";

// --- Database schemas (snake_case, matching PostgreSQL columns) ---

export const exerciseSectionSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    name: z.string().min(1),
    target_sets: z.number().int().nonnegative().default(10),
    date: z.string(),
    is_library: z.boolean().default(false),
    archived: z.boolean().default(false),
    library_section_id: z.string().uuid().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const createSectionSchema = z.object({
    name: z.string().min(1).max(100),
    target_sets: z.number().int().nonnegative().default(10),
    date: z.string(),
    is_library: z.boolean().optional().default(false),
    library_section_id: z.string().uuid().nullable().optional(),
});

export const updateSectionSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    target_sets: z.number().int().nonnegative().optional(),
    archived: z.boolean().optional(),
});

// DB-level types (snake_case)
export type ExerciseSectionRow = z.infer<typeof exerciseSectionSchema>;
export type CreateSectionDto = z.infer<typeof createSectionSchema>;
export type UpdateSectionDto = z.infer<typeof updateSectionSchema>;

// --- Client-facing types (camelCase, matching what the API returns after transformation) ---

export interface ExerciseSection {
    id: string;
    userId: string;
    name: string;
    targetSets: number;
    date: string;
    isLibrary: boolean;
    archived: boolean;
    librarySectionId: string | null;
    createdAt: string;
    updatedAt: string;
}
