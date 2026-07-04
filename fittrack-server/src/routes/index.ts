import { Router } from "express";
import type { SectionController } from "../controllers/section.controller";
import type { WorkoutController } from "../controllers/workout.controller";
import type { HabitController } from "../controllers/habit.controller";
import type { AnalyticsController } from "../controllers/analytics.controller";
import type { AIController } from "../controllers/ai.controller";
import { createSectionRoutes } from "./section.routes";
import { createWorkoutRoutes } from "./workout.routes";
import { createHabitRoutes, createCompletionRoutes } from "./habit.routes";
import { createAnalyticsRoutes } from "./analytics.routes";
import { createAIRoutes } from "./ai.routes";

interface Controllers {
    section: SectionController;
    workout: WorkoutController;
    habit: HabitController;
    analytics: AnalyticsController;
    ai: AIController;
}

export function createApiRouter(controllers: Controllers): Router {
    const router = Router();

    // Health check
    router.get("/health", (_req, res) => {
        res.json({ status: "ok" });
    });

    // Mount domain routes
    router.use("/sections", createSectionRoutes(controllers.section));
    router.use("/workouts", createWorkoutRoutes(controllers.workout));
    router.use("/habits", createHabitRoutes(controllers.habit));
    router.use("/completions", createCompletionRoutes(controllers.habit));
    router.use("/analytics", createAnalyticsRoutes(controllers.analytics));
    router.use("/ai", createAIRoutes(controllers.ai));

    return router;
}
