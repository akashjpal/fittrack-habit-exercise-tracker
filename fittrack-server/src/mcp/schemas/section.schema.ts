import { z } from "zod";

export const createSectionShape = {
    name: z.string().min(1).max(100).describe("Section name, e.g. 'Push Day' or 'Leg Day'"),
    targetSets: z.number().int().nonnegative().optional().describe("Target total sets for this section (default 10)"),
    date: z.string().describe("ISO date string this section belongs to, e.g. '2026-07-05'"),
    isLibrary: z.boolean().optional().describe("True to create a reusable template instead of a dated instance"),
    librarySectionId: z.string().uuid().nullable().optional().describe("Library template this instance was created from, if any"),
};

export const createLibrarySectionShape = {
    name: z.string().min(1).describe("Name of the reusable section template"),
};

export const updateSectionShape = {
    id: z.string().uuid(),
    name: z.string().min(1).max(100).optional(),
    targetSets: z.number().int().nonnegative().optional(),
    archived: z.boolean().optional(),
};

export const idShape = {
    id: z.string().uuid(),
};

export const weekRangeShape = {
    startDate: z.string().describe("ISO date string, start of range"),
    endDate: z.string().describe("ISO date string, end of range"),
};

export const libraryIdShape = {
    libraryId: z.string().uuid(),
};
