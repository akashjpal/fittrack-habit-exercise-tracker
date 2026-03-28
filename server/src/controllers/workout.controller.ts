import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import type { WorkoutService } from "../services/workout.service";

export class WorkoutController {
    constructor(private readonly workoutService: WorkoutService) { }

    getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const workouts = await this.workoutService.getAllWorkouts(req.userId);
            res.json(workouts);
        } catch (err) {
            next(err);
        }
    };

    getBySection = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const workouts = await this.workoutService.getWorkoutsBySection(req.params.sectionId);
            res.json(workouts);
        } catch (err) {
            next(err);
        }
    };

    getByWeek = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { startDate, endDate } = req.query as { startDate: string; endDate: string };
            const workouts = await this.workoutService.getWorkoutsByWeek(req.userId, startDate, endDate);
            res.json(workouts);
        } catch (err) {
            next(err);
        }
    };

    create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const workout = await this.workoutService.createWorkout(req.userId, req.body);
            res.status(201).json(workout);
        } catch (err) {
            next(err);
        }
    };

    createBatch = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { section_id, workouts } = req.body;
            const created = await this.workoutService.createBatchWorkouts(req.userId, section_id, workouts);
            res.status(201).json(created);
        } catch (err) {
            next(err);
        }
    };

    toggleStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const workout = await this.workoutService.toggleWorkoutStatus(req.params.id, req.body.completed);
            res.json(workout);
        } catch (err) {
            next(err);
        }
    };

    delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.workoutService.deleteWorkout(req.params.id);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    };
}
