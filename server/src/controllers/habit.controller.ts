import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import type { HabitService } from "../services/habit.service";

export class HabitController {
    constructor(private readonly habitService: HabitService) {}

    getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const habits = await this.habitService.getAllHabits(req.userId);
            res.json(habits);
        } catch (err) {
            next(err);
        }
    };

    create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const habit = await this.habitService.createHabit(req.userId, req.body);
            res.status(201).json(habit);
        } catch (err) {
            next(err);
        }
    };

    delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.habitService.deleteHabit(req.params.id);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    };

    getAllCompletions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const completions = await this.habitService.getAllCompletions(req.userId);
            res.json(completions);
        } catch (err) {
            next(err);
        }
    };

    getCompletionsByHabit = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const completions = await this.habitService.getCompletionsByHabit(req.params.habitId);
            res.json(completions);
        } catch (err) {
            next(err);
        }
    };

    createCompletion = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const completion = await this.habitService.createCompletion(req.userId, req.body);
            res.status(201).json(completion);
        } catch (err) {
            next(err);
        }
    };

    deleteCompletion = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.habitService.deleteCompletion(req.params.habitId, req.params.date);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    };
}
