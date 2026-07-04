import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import type { AIController } from "../controllers/ai.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, "../../uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Use diskStorage to preserve the file extension — Groq Whisper needs it to identify audio format
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || ".webm";
        const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        cb(null, `${unique}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith("audio/")) {
            cb(null, true);
        } else {
            cb(new Error("Only audio files are allowed"));
        }
    },
});

export function createAIRoutes(controller: AIController): Router {
    const router = Router();

    router.use(authMiddleware as any);

    router.post("/fit-check", controller.fitCheck as any);
    router.post("/analyze-habits", controller.analyzeHabits as any);
    router.post("/generate-workout", controller.generateWorkout as any);
    router.post("/generate-habits", controller.generateHabits as any);
    router.post("/voice-log", upload.single("audio") as any, controller.voiceLog as any);
    router.post("/plateau-detection", controller.plateauDetection as any);

    return router;
}
