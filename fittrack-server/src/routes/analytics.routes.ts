import { Router } from "express";
import type { AnalyticsController } from "../controllers/analytics.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export function createAnalyticsRoutes(controller: AnalyticsController): Router {
    const router = Router();

    router.use(authMiddleware as any);

    router.get("/dashboard", controller.getDashboard as any);
    router.get("/progress", controller.getProgress as any);

    return router;
}
