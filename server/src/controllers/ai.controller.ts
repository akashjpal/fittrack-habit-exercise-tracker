import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import type { AIService } from "../services/ai.service";
import { AppError } from "../utils/errors";
import fs from "fs";

export class AIController {
    constructor(private readonly aiService: AIService) { }

    fitCheck = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.aiService.fitCheck(req.userId);
            res.json(result);
        } catch (err) {
            next(err);
        }
    };

    analyzeHabits = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { activeTasks, completedTasks } = req.body;
            const result = await this.aiService.analyzeHabits(activeTasks || [], completedTasks || []);
            res.json(result);
        } catch (err) {
            next(err);
        }
    };

    generateWorkout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { prompt } = req.body;
            if (!prompt) {
                throw AppError.badRequest("prompt is required");
            }
            const result = await this.aiService.generateWorkout(prompt);
            res.json(result);
        } catch (err) {
            next(err);
        }
    };

    generateHabits = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { prompt } = req.body;
            if (!prompt) {
                throw AppError.badRequest("prompt is required");
            }
            const result = await this.aiService.generateHabits(prompt);
            res.json(result);
        } catch (err) {
            next(err);
        }
    };

    voiceLog = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const file = req.file;
            if (!file) {
                throw AppError.badRequest("Audio file is required");
            }

            const audioBuffer = fs.readFileSync(file.path);
            const base64Audio = audioBuffer.toString("base64");
            const mimeType = file.mimetype || "audio/webm";

            const result = await this.aiService.processVoiceLog(base64Audio, mimeType);

            // Cleanup uploaded file
            fs.unlinkSync(file.path);

            res.json(result);
        } catch (err) {
            next(err);
        }
    };

    plateauDetection = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { libraryId } = req.body;
            if (!libraryId) {
                throw AppError.badRequest("libraryId is required");
            }
            const result = await this.aiService.detectPlateauForLibrary(req.userId, libraryId);
            res.json(result);
        } catch (err) {
            next(err);
        }
    };
}
