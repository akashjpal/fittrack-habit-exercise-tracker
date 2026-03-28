import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import type { SectionService } from "../services/section.service";

export class SectionController {
    constructor(private readonly sectionService: SectionService) {}

    getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sections = await this.sectionService.getAllSections(req.userId);
            res.json(sections);
        } catch (err) {
            next(err);
        }
    };

    getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const section = await this.sectionService.getSectionById(req.params.id);
            res.json(section);
        } catch (err) {
            next(err);
        }
    };

    getByWeek = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { startDate, endDate } = req.query as { startDate: string; endDate: string };
            const sections = await this.sectionService.getSectionsByWeek(req.userId, startDate, endDate);
            res.json(sections);
        } catch (err) {
            next(err);
        }
    };

    getLibrary = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sections = await this.sectionService.getLibrary(req.userId);
            res.json(sections);
        } catch (err) {
            next(err);
        }
    };

    getActiveLibrary = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sections = await this.sectionService.getActiveLibrary(req.userId);
            res.json(sections);
        } catch (err) {
            next(err);
        }
    };

    create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const section = await this.sectionService.createSection(req.userId, req.body);
            res.status(201).json(section);
        } catch (err) {
            next(err);
        }
    };

    createLibrary = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const section = await this.sectionService.createLibrarySection(req.userId, req.body.name);
            res.status(201).json(section);
        } catch (err) {
            next(err);
        }
    };

    update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const section = await this.sectionService.updateSection(req.params.id, req.body);
            res.json(section);
        } catch (err) {
            next(err);
        }
    };

    delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.sectionService.deleteSection(req.params.id);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    };
}
