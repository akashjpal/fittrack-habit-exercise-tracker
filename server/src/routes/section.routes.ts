import { Router } from "express";
import type { SectionController } from "../controllers/section.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validation.middleware";
import { createSectionSchema, updateSectionSchema } from "@fittrack/shared";

export function createSectionRoutes(controller: SectionController): Router {
    const router = Router();

    router.use(authMiddleware as any);

    // Library routes must come before /:id to avoid matching "library" as an id
    router.get("/library", controller.getLibrary as any);
    router.get("/library/active", controller.getActiveLibrary as any);
    router.post("/library", controller.createLibrary as any);

    router.get("/", controller.getAll as any);
    router.get("/week", controller.getByWeek as any);
    router.get("/:id", controller.getById as any);
    router.post("/", validateBody(createSectionSchema) as any, controller.create as any);
    router.patch("/:id", validateBody(updateSectionSchema) as any, controller.update as any);
    router.delete("/:id", controller.delete as any);

    return router;
}
