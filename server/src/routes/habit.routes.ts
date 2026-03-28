import { Router } from "express";
import type { HabitController } from "../controllers/habit.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validation.middleware";
import { createHabitSchema, createCompletionSchema } from "@fittrack/shared";

export function createHabitRoutes(controller: HabitController): Router {
    const router = Router();

    router.use(authMiddleware as any);

    router.get("/", controller.getAll as any);
    router.post("/", validateBody(createHabitSchema) as any, controller.create as any);
    router.delete("/:id", controller.delete as any);

    return router;
}

export function createCompletionRoutes(controller: HabitController): Router {
    const router = Router();

    router.use(authMiddleware as any);

    router.get("/", controller.getAllCompletions as any);
    router.get("/:habitId", controller.getCompletionsByHabit as any);
    router.post("/", validateBody(createCompletionSchema) as any, controller.createCompletion as any);
    router.delete("/:habitId/:date", controller.deleteCompletion as any);

    return router;
}
