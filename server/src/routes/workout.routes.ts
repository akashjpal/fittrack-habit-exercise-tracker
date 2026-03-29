import { Router } from "express";
import type { WorkoutController } from "../controllers/workout.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validation.middleware";
import { createWorkoutSchema, batchCreateWorkoutSchema } from "../shared/index";

export function createWorkoutRoutes(controller: WorkoutController): Router {
    const router = Router();

    router.use(authMiddleware as any);

    router.get("/", controller.getAll as any);
    router.get("/week", controller.getByWeek as any);
    router.get("/section/:sectionId", controller.getBySection as any);
    router.post("/", validateBody(createWorkoutSchema) as any, controller.create as any);
    router.post("/batch", validateBody(batchCreateWorkoutSchema) as any, controller.createBatch as any);
    router.patch("/:id/status", controller.toggleStatus as any);
    router.delete("/:id", controller.delete as any);

    return router;
}
