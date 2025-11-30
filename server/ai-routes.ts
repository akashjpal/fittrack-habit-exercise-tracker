import type { Express } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";

import { authenticateToken, AuthRequest } from "./auth";

export function registerAIRoutes(app: Express) {
    // Initialize Gemini
    // Note: Ensure GEMINI_API_KEY is set in your .env file
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    app.post("/api/ai/fit-check", authenticateToken, async (req: AuthRequest, res) => {
        try {
            const userId = req.user!.id;
            // Fetch user data for context
            const workouts = await storage.getAllWorkouts(userId);
            const sections = await storage.getAllSections(userId);
            const habits = await storage.getAllHabits(userId);
            const completions = await storage.getAllCompletions(userId);

            // Prepare context string
            // We limit the data to avoid hitting token limits if the history is huge
            // For a real app, you might want to summarize this data first
            const context = JSON.stringify({
                workouts: workouts.slice(0, 100),
                sections,
                habits,
                completions: completions.slice(0, 100)
            });

            const prompt = `
        You are an AI fitness coach. Analyze the following user data (workouts, sections, habits, completions) and provide a "Fit Check".
        
        Data: ${context}

        Please provide the response in the following VALID JSON format (do not wrap in markdown code blocks):
        {
          "motivation": "A short, punchy motivational quote or message based on their recent activity.",
          "strengths": ["Point 1", "Point 2"],
          "weaknesses": ["Point 1", "Point 2"],
          "solutions": ["Solution 1", "Solution 2"]
        }
        
        Keep it encouraging but honest. If there is little data, encourage them to start logging.
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up markdown code blocks if present (just in case)
            const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();

            try {
                const data = JSON.parse(jsonStr);
                res.json(data);
            } catch (parseError) {
                console.error("Failed to parse AI response:", text);
                res.status(500).json({ error: "Failed to parse AI response" });
            }
        } catch (error: any) {
            console.error("AI Fit Check Error:", error);
            res.status(500).json({ error: error.message || "Failed to generate fit check" });
        }
    });
}
