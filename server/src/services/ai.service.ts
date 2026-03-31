import Groq from "groq-sdk";
import fs from "fs";
import { env } from "../config/env";
import type { IWorkoutRepository } from "../repositories/interfaces/IWorkoutRepository";
import type { ISectionRepository } from "../repositories/interfaces/ISectionRepository";
import type { IHabitRepository } from "../repositories/interfaces/IHabitRepository";
import { AppError } from "../utils/errors";

interface FitCheckResult {
    motivation: string;
    strengths: string[];
    weaknesses: string[];
    solutions: string[];
}

interface GeneratedWorkout {
    workout_name: string;
    exercises: Array<{
        name: string;
        sets: number;
        reps: number;
        weight: number;
        unit: string;
        notes: string;
    }>;
}

interface GeneratedHabits {
    habits: Array<{
        name: string;
        frequency: "daily" | "weekly";
        description: string;
    }>;
}

interface ParsedVoiceLog {
    workouts: Array<{
        exercise_type: string;
        sets: number;
        reps: number;
        weight: number;
        unit: string;
    }>;
}

interface PlateauResult {
    plateauDetected: boolean;
    summary: string;
    exercises: Array<{
        name: string;
        status: "plateau" | "progressing" | "declining";
        insight: string;
        suggestion: string;
    }>;
    recommendations: string[];
}

export class AIService {
    private groq: Groq;

    constructor(
        private readonly workoutRepo: IWorkoutRepository,
        private readonly sectionRepo: ISectionRepository,
        private readonly habitRepo: IHabitRepository,
    ) {
        if (!env.GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is required for AI features");
        }
        this.groq = new Groq({ apiKey: env.GROQ_API_KEY });
    }

    private async chatCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
        const result = await this.groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: 0,
            response_format: { type: "json_object" },
        });
        return result.choices[0]?.message?.content ?? "";
    }

    async fitCheck(userId: string): Promise<FitCheckResult> {
        const [workouts, sections, habits, completions] = await Promise.all([
            this.workoutRepo.findAllByUser(userId),
            this.sectionRepo.findAllByUser(userId),
            this.habitRepo.findAllByUser(userId),
            this.habitRepo.findAllCompletions(userId),
        ]);

        const systemPrompt = `You are a fitness coach AI. Analyze the user's workout and habit data and provide personalized feedback. Respond ONLY with valid JSON in this exact format:
{
  "motivation": "A brief motivational message",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "solutions": ["solution 1", "solution 2", "solution 3"]
}`;

        const userPrompt = `Workout Data:
${JSON.stringify(workouts.slice(0, 50), null, 2)}

Sections:
${JSON.stringify(sections, null, 2)}

Habits:
${JSON.stringify(habits, null, 2)}

Habit Completions (recent):
${JSON.stringify(completions.slice(0, 50), null, 2)}`;

        const text = await this.chatCompletion(systemPrompt, userPrompt);
        return this.parseJSON<FitCheckResult>(text);
    }

    async analyzeHabits(activeTasks: string[], completedTasks: string[]): Promise<{ analysis: string }> {
        const result = await this.groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are a productivity and habit coach. Provide a brief, encouraging analysis of the user's habit patterns, what they're doing well, and suggestions for improvement. Keep it to 2-3 paragraphs." },
                { role: "user", content: `Active Tasks: ${JSON.stringify(activeTasks)}\nCompleted Tasks: ${JSON.stringify(completedTasks)}` },
            ],
            temperature: 0.7,
        });
        return { analysis: result.choices[0]?.message?.content ?? "" };
    }

    async generateWorkout(prompt: string): Promise<GeneratedWorkout> {
        const systemPrompt = `You are a fitness trainer. Generate a workout plan based on the user's request. Respond ONLY with valid JSON in this exact format:
{
  "workout_name": "Name of the workout",
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "reps": 10,
      "weight": 0,
      "unit": "lbs",
      "notes": "Brief form tip"
    }
  ]
}
Generate 4-8 exercises.`;

        const text = await this.chatCompletion(systemPrompt, prompt);
        return this.parseJSON<GeneratedWorkout>(text);
    }

    async generateHabits(prompt: string): Promise<GeneratedHabits> {
        const systemPrompt = `You are a wellness coach. Generate healthy habits based on the user's request. Respond ONLY with valid JSON in this exact format:
{
  "habits": [
    {
      "name": "Habit Name",
      "frequency": "daily",
      "description": "Brief description"
    }
  ]
}
Generate 3-5 habits. frequency must be "daily" or "weekly".`;

        const text = await this.chatCompletion(systemPrompt, prompt);
        return this.parseJSON<GeneratedHabits>(text);
    }

    async processVoiceLog(audioFilePath: string, mimeType: string): Promise<ParsedVoiceLog> {
        // Step 1: Transcribe audio using Groq Whisper
        const transcription = await this.groq.audio.transcriptions.create({
            file: fs.createReadStream(audioFilePath),
            model: "whisper-large-v3-turbo",
            language: "en",
            response_format: "text",
        });

        const transcript = typeof transcription === "string" ? transcription : transcription.text;

        if (!transcript || transcript.trim().length === 0) {
            throw AppError.badRequest("Could not transcribe audio. Please speak clearly and try again.");
        }

        // Step 2: Parse the transcript into structured workout data using chat
        const systemPrompt = `You are a fitness assistant. Parse the user's spoken workout description into structured data. Respond ONLY with valid JSON in this exact format:
{
  "workouts": [
    {
      "exercise_type": "Exercise Name",
      "sets": 3,
      "reps": 10,
      "weight": 0,
      "unit": "kg"
    }
  ]
}
Extract all exercises mentioned. If weight is not mentioned, use 0. If unit is not mentioned, default to "kg".`;

        const text = await this.chatCompletion(systemPrompt, `Transcribed workout description: "${transcript}"`);
        return this.parseJSON<ParsedVoiceLog>(text);
    }

    async detectPlateauForLibrary(userId: string, libraryId: string): Promise<PlateauResult> {
        const sectionInstances = await this.sectionRepo.findByLibraryId(libraryId);

        if (sectionInstances.length === 0) {
            return {
                plateauDetected: false,
                summary: "No workout sessions found for this section. Add workouts to enable plateau detection.",
                exercises: [],
                recommendations: ["Start logging workouts for this section to track your progress."],
            };
        }

        const allWorkouts: Array<{ exercise_type: string; sets: number; reps: number; weight: number; unit: string; date: string }> = [];
        for (const section of sectionInstances) {
            const workouts = await this.workoutRepo.findBySectionId(section.id);
            for (const w of workouts) {
                allWorkouts.push({
                    exercise_type: w.exercise_type,
                    sets: w.sets,
                    reps: w.reps,
                    weight: w.weight,
                    unit: w.unit,
                    date: w.date,
                });
            }
        }

        allWorkouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return this.detectPlateau(allWorkouts);
    }

    async detectPlateau(workouts: Array<{ exercise_type: string; sets: number; reps: number; weight: number; unit: string; date: string }>): Promise<PlateauResult> {
        if (workouts.length < 3) {
            return {
                plateauDetected: false,
                summary: "Not enough workout data to analyze. Log more sessions to detect plateaus.",
                exercises: [],
                recommendations: ["Continue logging your workouts consistently to enable plateau detection."],
            };
        }

        const systemPrompt = `You are an expert strength coach analyzing workout history for plateaus and stagnation. Analyze each exercise for whether weight/volume has stalled, whether performance is declining, and progressive overload trends. Respond ONLY with valid JSON in this exact format:
{
  "plateauDetected": true,
  "summary": "Brief 1-2 sentence overall assessment",
  "exercises": [
    {
      "name": "Exercise Name",
      "status": "plateau",
      "insight": "Brief insight about this exercise's trend",
      "suggestion": "Specific actionable suggestion"
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}
The status field must be one of: "plateau", "progressing", or "declining".`;

        const text = await this.chatCompletion(systemPrompt, `Workout History (ordered by date):\n${JSON.stringify(workouts, null, 2)}`);
        return this.parseJSON<PlateauResult>(text);
    }

    private parseJSON<T>(text: string): T {
        const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
        try {
            return JSON.parse(cleaned) as T;
        } catch {
            throw AppError.internal(`Failed to parse AI response as JSON: ${cleaned.slice(0, 200)}`);
        }
    }
}
