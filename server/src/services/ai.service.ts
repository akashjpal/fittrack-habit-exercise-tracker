import { GoogleGenerativeAI } from "@google/generative-ai";
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
    private genAI: GoogleGenerativeAI;

    constructor(
        private readonly workoutRepo: IWorkoutRepository,
        private readonly sectionRepo: ISectionRepository,
        private readonly habitRepo: IHabitRepository,
    ) {
        if (!env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is required for AI features");
        }
        this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }

    async fitCheck(userId: string): Promise<FitCheckResult> {
        const [workouts, sections, habits, completions] = await Promise.all([
            this.workoutRepo.findAllByUser(userId),
            this.sectionRepo.findAllByUser(userId),
            this.habitRepo.findAllByUser(userId),
            this.habitRepo.findAllCompletions(userId),
        ]);

        const prompt = `You are a fitness coach AI. Analyze this user's workout and habit data and provide personalized feedback.

Workout Data:
${JSON.stringify(workouts.slice(0, 50), null, 2)}

Sections:
${JSON.stringify(sections, null, 2)}

Habits:
${JSON.stringify(habits, null, 2)}

Habit Completions (recent):
${JSON.stringify(completions.slice(0, 50), null, 2)}

Respond in this exact JSON format:
{
  "motivation": "A brief motivational message",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "solutions": ["solution 1", "solution 2", "solution 3"]
}

Only return valid JSON, no markdown or extra text.`;

        const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return this.parseJSON<FitCheckResult>(text);
    }

    async analyzeHabits(activeTasks: string[], completedTasks: string[]): Promise<{ analysis: string }> {
        const prompt = `You are a productivity and habit coach. Analyze these tasks and provide insights.

Active Tasks: ${JSON.stringify(activeTasks)}
Completed Tasks: ${JSON.stringify(completedTasks)}

Provide a brief, encouraging analysis of the user's habit patterns, what they're doing well, and suggestions for improvement. Keep it to 2-3 paragraphs.`;

        const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        return { analysis: result.response.text() };
    }

    async generateWorkout(prompt: string): Promise<GeneratedWorkout> {
        const fullPrompt = `You are a fitness trainer. Generate a workout plan based on this request: "${prompt}"

Respond in this exact JSON format:
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

Generate 4-8 exercises. Only return valid JSON, no markdown or extra text.`;

        const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(fullPrompt);
        const text = result.response.text();

        return this.parseJSON<GeneratedWorkout>(text);
    }

    async generateHabits(prompt: string): Promise<GeneratedHabits> {
        const fullPrompt = `You are a wellness coach. Generate healthy habits based on this request: "${prompt}"

Respond in this exact JSON format:
{
  "habits": [
    {
      "name": "Habit Name",
      "frequency": "daily",
      "description": "Brief description"
    }
  ]
}

Generate 3-5 habits. frequency must be "daily" or "weekly". Only return valid JSON, no markdown or extra text.`;

        const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(fullPrompt);
        const text = result.response.text();

        return this.parseJSON<GeneratedHabits>(text);
    }

    async processVoiceLog(base64Audio: string, mimeType: string): Promise<ParsedVoiceLog> {
        const prompt = `You are a fitness assistant. Listen to this audio of someone describing their workout and extract the exercises.

Return the data in this exact JSON format:
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

Only return valid JSON, no markdown or extra text.`;

        const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Audio,
                    mimeType,
                },
            },
        ]);
        const text = result.response.text();

        return this.parseJSON<ParsedVoiceLog>(text);
    }

    async detectPlateauForLibrary(userId: string, libraryId: string): Promise<PlateauResult> {
        // 1. Get all section instances linked to this library template
        const sectionInstances = await this.sectionRepo.findByLibraryId(libraryId);

        if (sectionInstances.length === 0) {
            return {
                plateauDetected: false,
                summary: "No workout sessions found for this section. Add workouts to enable plateau detection.",
                exercises: [],
                recommendations: ["Start logging workouts for this section to track your progress."],
            };
        }

        // 2. Gather all workouts from those section instances
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

        // Sort by date ascending for trend analysis
        allWorkouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // 3. Call AI analysis
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

        const prompt = `You are an expert strength coach analyzing workout history for plateaus and stagnation.

Workout History (ordered by date):
${JSON.stringify(workouts, null, 2)}

Analyze each exercise for:
1. Whether weight/volume has stalled (plateau)
2. Whether performance is declining
3. Progressive overload trends

Respond in this exact JSON format:
{
  "plateauDetected": true,
  "summary": "Brief 1-2 sentence overall assessment",
  "exercises": [
    {
      "name": "Exercise Name",
      "status": "plateau" | "progressing" | "declining",
      "insight": "Brief insight about this exercise's trend",
      "suggestion": "Specific actionable suggestion"
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Only return valid JSON, no markdown or extra text.`;

        const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return this.parseJSON<PlateauResult>(text);
    }

    private parseJSON<T>(text: string): T {
        // Strip markdown code fences if present
        const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
        try {
            return JSON.parse(cleaned) as T;
        } catch {
            throw AppError.internal(`Failed to parse AI response as JSON: ${cleaned.slice(0, 200)}`);
        }
    }
}
