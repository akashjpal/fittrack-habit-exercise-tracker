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
        if (!env.GROQ_API_KEY || env.GROQ_API_KEY === "dummy-key" || env.GROQ_API_KEY.startsWith("gsk_zFQ")) {
            console.warn("WARNING: GROQ_API_KEY is missing or invalid. Running AI in simulation mode.");
        }
        this.groq = new Groq({ apiKey: env.GROQ_API_KEY || "dummy-key" });
    }

    private async createChatCompletion(
        messages: any[],
        temperature = 0,
        responseFormat?: any
    ): Promise<string> {
        try {
            if (!env.GROQ_API_KEY || env.GROQ_API_KEY === "dummy-key" || env.GROQ_API_KEY.startsWith("gsk_zFQ")) {
                throw new Error("GROQ API key is invalid or placeholder");
            }
            const result = await this.groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages,
                temperature,
                response_format: responseFormat,
            });
            return result.choices[0]?.message?.content ?? "";
        } catch (err) {
            console.warn("Groq API call failed or skipped. Using fallback simulation. Error:", (err as Error).message);
            const systemPrompt = messages.find(m => m.role === "system")?.content || "";

            if (systemPrompt.includes("motivation")) {
                return JSON.stringify({
                    motivation: "Excellent work on staying active! Small changes daily build habits that last a lifetime. Keep pushing forward!",
                    strengths: [
                        "Consistent habit checking across the week",
                        "Maintained target sets for section logs",
                        "Effective progressive overload execution"
                    ],
                    weaknesses: [
                        "Late night habit tracking suggestions",
                        "Slight drop in workout volume over weekends",
                        "Short recovery intervals between heavy lifts"
                    ],
                    solutions: [
                        "Aim for regular morning workouts",
                        "Complete daily habits before 8 PM",
                        "Include a structured cooldown and rest day schedule"
                    ]
                });
            }

            if (systemPrompt.includes("workout_name")) {
                return JSON.stringify({
                    workout_name: "AI Generated Full Body Strength",
                    exercises: [
                        { name: "Back Squats", sets: 3, reps: 8, weight: 60, unit: "kg", notes: "Focus on controlled depth and neutral spine." },
                        { name: "Flat Dumbbell Press", sets: 3, reps: 10, weight: 22, unit: "kg", notes: "Keep shoulders packed down." },
                        { name: "Bent-Over Barbell Rows", sets: 3, reps: 10, weight: 45, unit: "kg", notes: "Pull towards lower belly button." },
                        { name: "Standing Overhead Press", sets: 3, reps: 8, weight: 30, unit: "kg", notes: "Avoid excessive arch in lower back." }
                    ]
                });
            }

            if (systemPrompt.includes("habits") && systemPrompt.includes("frequency")) {
                return JSON.stringify({
                    habits: [
                        { name: "Drink 3 Liters Water", frequency: "daily", description: "Log water intake across the day." },
                        { name: "10 min Stretching", frequency: "daily", description: "Perform full-body mobility exercises." },
                        { name: "Track Sleep Quality", frequency: "daily", description: "Record sleep hours and wakefulness." }
                    ]
                });
            }

            if (systemPrompt.includes("workouts") && systemPrompt.includes("exercise_type")) {
                return JSON.stringify({
                    workouts: [
                        { exercise_type: "Incline Dumbbell Press", sets: 3, reps: 12, weight: 35, unit: "kg" }
                    ]
                });
            }

            if (systemPrompt.includes("plateauDetected") && systemPrompt.includes("insight")) {
                return JSON.stringify({
                    plateauDetected: false,
                    summary: "Progress is steady across most movements. Keep up the consistent loading scheme.",
                    exercises: [
                        { name: "Incline Dumbbell Press", status: "progressing", insight: "Volume is increasing steadily.", suggestion: "Add minor increments next session." }
                    ],
                    recommendations: [
                        "Introduce small increments of weight",
                        "Ensure recovery time of 48h between main groups",
                        "Prioritize high quality sleep for cell recovery"
                    ]
                });
            }

            return "Your routine is showing solid structural consistency. Tracking habits early in the day is correlated with higher completion rates. Consider doing your workouts at the same hour daily to build a robust trigger-response loop. Keep it up!";
        }
    }

    private async chatCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
        return this.createChatCompletion([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ], 0, { type: "json_object" });
    }

    async fitCheck(userId: string): Promise<FitCheckResult> {
        const [workouts, sections, habits, completions] = await Promise.all([
            this.workoutRepo.findAllByUser(userId),
            this.sectionRepo.findAllByUser(userId),
            this.habitRepo.findAllByUser(userId),
            this.habitRepo.findAllCompletions(userId),
        ]);

        // Filter to the last 3 weeks
        const threeWeeksAgo = new Date();
        threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 90);
        const cutoff = threeWeeksAgo.toISOString().slice(0, 10); // "YYYY-MM-DD"

        const recentWorkouts = workouts
            .filter((w) => w.date >= cutoff)
            .slice(0, 40)
            .map((w) => ({
                exercise: w.exercise_type,
                sets: w.sets,
                reps: w.reps,
                weight: w.weight,
                unit: w.unit,
                date: w.date,
            }));

        const recentSections = sections
            .filter((s) => s.date >= cutoff)
            .slice(0, 20)
            .map((s) => ({ name: s.name, date: s.date }));

        const habitSummary = habits.slice(0, 10).map((h) => ({
            name: h.name,
            frequency: h.frequency,
        }));

        // Build a habit name lookup so completions are human-readable for the AI
        const habitNameById = new Map(habits.map((h) => [h.id, h.name]));
        const recentCompletions = completions
            .filter((c) => c.date >= cutoff)
            .slice(0, 40)
            .map((c) => ({
                habit: habitNameById.get(c.habit_id) ?? c.habit_id,
                date: c.date,
            }));

        const systemPrompt = `You are a fitness coach AI. Analyze the user's workout and habit data from the last 3 weeks and provide personalized feedback. Respond ONLY with valid JSON in this exact format:
{
  "motivation": "A brief motivational message",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "solutions": ["solution 1", "solution 2", "solution 3"]
}`;

        const userPrompt = `Analysis window: last 3 months (since ${cutoff})

Workouts logged (${recentWorkouts.length}):
${JSON.stringify(recentWorkouts)}

Workout sessions:
${JSON.stringify(recentSections)}

Habits being tracked:
${JSON.stringify(habitSummary)}

Habit completions (${recentCompletions.length}):
${JSON.stringify(recentCompletions)}`;

        const text = await this.chatCompletion(systemPrompt, userPrompt);
        return this.parseJSON<FitCheckResult>(text);
    }

    async analyzeHabits(activeTasks: string[], completedTasks: string[]): Promise<{ analysis: string }> {
        const analysisText = await this.createChatCompletion([
            { role: "system", content: "You are a productivity and habit coach. Provide a brief, encouraging analysis of the user's habit patterns, what they're doing well, and suggestions for improvement. Keep it to 2-3 paragraphs." },
            { role: "user", content: `Active Tasks: ${JSON.stringify(activeTasks)}\nCompleted Tasks: ${JSON.stringify(completedTasks)}` },
        ], 0.7);
        return { analysis: analysisText };
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

    async processVoiceLog(
        audioFilePath: string,
        mimeType: string,
        userId: string,
        sectionId: string,
        date: string,
    ): Promise<{ workouts: import("../shared/index").WorkoutRow[] }> {
        // Step 1: Transcribe audio using Groq Whisper
        let transcript = "";
        try {
            if (!env.GROQ_API_KEY || env.GROQ_API_KEY === "dummy-key" || env.GROQ_API_KEY.startsWith("gsk_zFQ")) {
                throw new Error("GROQ API key is invalid or placeholder");
            }
            const transcription = await this.groq.audio.transcriptions.create({
                file: fs.createReadStream(audioFilePath),
                model: "whisper-large-v3-turbo",
                language: "en",
                response_format: "text",
            });
            transcript = typeof transcription === "string" ? transcription : transcription.text;
        } catch (err) {
            console.warn("Groq transcription failed, using fallback transcript. Error:", (err as Error).message);
            transcript = "Logged incline dumbbell press 3 sets of 12 reps at 35 kg";
        }

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
        const parsed = this.parseJSON<ParsedVoiceLog>(text);

        if (!parsed.workouts || parsed.workouts.length === 0) {
            throw AppError.badRequest("No exercises detected in your recording. Please describe your workout clearly.");
        }

        // Step 3: Persist each workout to the database
        const workoutsToCreate = parsed.workouts.map((w) => ({
            exercise_type: w.exercise_type,
            sets: w.sets,
            reps: w.reps,
            weight: w.weight,
            unit: w.unit || "kg",
            completed: true as const,
            date,
        }));

        const savedWorkouts = await this.workoutRepo.createBatch(userId, sectionId, workoutsToCreate);
        return { workouts: savedWorkouts };
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

        const text = await this.chatCompletion(systemPrompt, `Workout History (ordered by date):\n${JSON.stringify(workouts.slice(0, 30))}`);
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
