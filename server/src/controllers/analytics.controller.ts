import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import type { AnalyticsService } from "../services/analytics.service";

export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    getDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dashboard = await this.analyticsService.getDashboard(req.userId);
            res.json(dashboard);
        } catch (err) {
            next(err);
        }
    };

    getProgress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const progress = await this.analyticsService.getProgress(req.userId);
            res.json(progress);
        } catch (err) {
            next(err);
        }
    };
}
