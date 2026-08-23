import { createClient } from "@insforge/sdk";
import fs from "fs";
import { execSync } from "child_process";

const BASE_URL = "https://tvg89cmj.ap-southeast.insforge.app";
const ANON_KEY = "ik_3517a654c34b7c7492b3809c49b54e16";
const SERVICE_KEY = "ik_3517a654c34b7c7492b3809c49b54e16";
const API_URL = "http://localhost:5000/api";

const insforge = createClient({
    baseUrl: BASE_URL,
    anonKey: ANON_KEY,
});

const insforgeAdmin = createClient({
    baseUrl: BASE_URL,
    anonKey: SERVICE_KEY,
    isServerMode: true,
});

async function run() {
    console.log("==================================================");
    console.log("Starting Fitness Tracker Integration Tests...");
    console.log("==================================================");

    const testResults = {
        signup: { status: "pending", details: null },
        verification: { status: "pending", details: null },
        login: { status: "pending", details: null },
        healthCheck: { status: "pending", details: null },
        exerciseLibrary: { status: "pending", details: null },
        workoutLog: { status: "pending", details: null },
        habits: { status: "pending", details: null },
        aiFitCheck: { status: "pending", details: null },
        databaseVerification: { status: "pending", details: null }
    };

    const email = `testuser_${Date.now()}@example.com`;
    const password = "Password123!";
    const name = "Test Runner";
    let userId = null;
    let token = null;

    try {
        // Step 1: Signup
        console.log(`\n--- Step 1: Signup (${email}) ---`);
        const signupRes = await insforge.auth.signUp({ email, password, name });
        if (signupRes.error) {
            testResults.signup = { status: "failed", details: signupRes.error.message };
            throw new Error(`Signup failed: ${signupRes.error.message}`);
        }
        console.log("Signup successful!");
        testResults.signup = { status: "passed", details: signupRes.data };

        // Step 2: Verification (if required)
        if (signupRes.data?.requireEmailVerification) {
            console.log("\n--- Step 2: Email Verification Required ---");
            // Try updating confirmation in the DB directly
            try {
                console.log("Attempting database bypass for email confirmation using insforge-cli...");
                execSync(`npx @insforge/cli db query "UPDATE auth.users SET email_verified = true WHERE email = '${email}'"`, { stdio: "inherit" });
                console.log("Bypassed email verification via database update using CLI!");
                testResults.verification = { status: "passed", details: "Bypassed via CLI auth.users update" };
            } catch (err) {
                console.log("Bypass error: " + err.message);
                testResults.verification = { status: "failed", details: err.message };
            }
        } else {
            console.log("\n--- Step 2: Email Verification Bypassed ---");
            testResults.verification = { status: "passed", details: "Not required" };
        }

        // Step 3: Login
        console.log("\n--- Step 3: Login ---");
        const loginRes = await insforge.auth.signInWithPassword({ email, password });
        if (loginRes.error) {
            testResults.login = { status: "failed", details: loginRes.error.message };
            throw new Error(`Login failed: ${loginRes.error.message}`);
        }
        token = loginRes.data?.accessToken || loginRes.data?.session?.access_token;
        userId = loginRes.data?.user?.id;
        console.log(`Login successful! User ID: ${userId}`);
        testResults.login = { status: "passed", details: { userId } };

        // Helper API Request wrapper
        const api = async (path, method = "GET", body = null) => {
            const headers = { "Authorization": `Bearer ${token}` };
            if (body) headers["Content-Type"] = "application/json";
            const response = await fetch(`${API_URL}${path}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null
            });
            if (response.status === 204) return null;
            const text = await response.text();
            if (!response.ok) throw new Error(`API ${method} ${path} failed (${response.status}): ${text}`);
            try {
                return JSON.parse(text);
            } catch {
                return text;
            }
        };

        // Step 4: Health Check
        console.log("\n--- Step 4: Health Check ---");
        const health = await api("/health");
        console.log("Health Check Response:", health);
        if (health.status === "ok") {
            testResults.healthCheck = { status: "passed" };
        } else {
            testResults.healthCheck = { status: "failed", details: health };
        }

        // Step 5: Exercise Library & Sections
        console.log("\n--- Step 5: Exercise Library & Sections ---");
        // Create Workout Section
        console.log("Creating workout section...");
        const section = await api("/sections", "POST", {
            name: "Chest & Triceps Focus",
            targetSets: 12,
            date: new Date().toISOString()
        });
        console.log("Section Created:", section);

        // Edit Workout Section
        console.log("Editing workout section...");
        const updatedSection = await api(`/sections/${section.id}`, "PATCH", {
            name: "Chest & Triceps - Heavy",
            targetSets: 15
        });
        console.log("Section Updated:", updatedSection);

        if (updatedSection.name === "Chest & Triceps - Heavy" && updatedSection.targetSets === 15) {
            testResults.exerciseLibrary = { status: "passed", details: { sectionId: section.id } };
        } else {
            testResults.exerciseLibrary = { status: "failed", details: "Section update verification failed" };
        }

        // Step 6: Workout Log & History
        console.log("\n--- Step 6: Workout Log & History ---");
        // Log workout
        console.log("Logging a workout...");
        const workout = await api("/workouts", "POST", {
            sectionId: section.id,
            exerciseType: "Incline Dumbbell Press",
            sets: 3,
            reps: 12,
            weight: 35,
            unit: "kg",
            completed: true
        });
        console.log("Workout Logged:", workout);

        // Verify history updates
        console.log("Fetching workout history...");
        const history = await api("/workouts");
        const found = history.find(w => w.id === workout.id);
        if (found && found.exerciseType === "Incline Dumbbell Press" && found.sets === 3) {
            console.log("Workout logged successfully and verified in history!");
            testResults.workoutLog = { status: "passed", details: { workoutId: workout.id } };
        } else {
            testResults.workoutLog = { status: "failed", details: "Workout not found in history or values mismatch" };
        }

        // Step 7: Habits Command Center
        console.log("\n--- Step 7: Habits Command Center ---");
        // Add a habit
        console.log("Adding a habit...");
        const habit = await api("/habits", "POST", {
            name: "Meditate for 10 mins",
            frequency: "daily"
        });
        console.log("Habit Created:", habit);

        // Mark complete
        console.log("Marking habit complete...");
        const completionDate = new Date().toISOString().slice(0, 10) + "T00:00:00.000Z";
        const completion = await api("/completions", "POST", {
            habitId: habit.id,
            date: completionDate
        });
        console.log("Completion Created:", completion);

        // Verify completion history
        console.log("Verifying completion history...");
        const completions = await api(`/completions/${habit.id}`);
        const hasCompletion = completions.some(c => c.habitId === habit.id);

        // Mark incomplete
        console.log("Marking habit incomplete (deleting completion)...");
        await api(`/completions/${habit.id}/${encodeURIComponent(completionDate)}`, "DELETE");

        // Verify completion is gone
        const completionsAfter = await api(`/completions/${habit.id}`);
        const noCompletion = !completionsAfter.some(c => c.habitId === habit.id);

        if (habit.id && hasCompletion && noCompletion) {
            console.log("Habit lifecycle (create -> complete -> incomplete) verified!");
            testResults.habits = { status: "passed", details: { habitId: habit.id } };
        } else {
            testResults.habits = { status: "failed", details: `habitId: ${habit.id}, hasCompletion: ${hasCompletion}, noCompletion: ${noCompletion}` };
        }

        // Step 8: AI FitCheck
        console.log("\n--- Step 8: AI FitCheck ---");
        console.log("Calling AI FitCheck endpoint...");
        const aiResponse = await api("/ai/fit-check", "POST");
        console.log("AI FitCheck Response:", aiResponse);
        if (aiResponse.motivation && Array.isArray(aiResponse.strengths) && Array.isArray(aiResponse.solutions)) {
            testResults.aiFitCheck = { status: "passed", details: aiResponse };
        } else {
            testResults.aiFitCheck = { status: "failed", details: aiResponse };
        }

        // Step 9: Verify database updates directly using admin client
        console.log("\n--- Step 9: Verify Database Updates ---");
        console.log("Querying database directly using insforgeAdmin client...");
        
        const { data: dbSection } = await insforgeAdmin.database
            .from("exercise_sections")
            .select("*")
            .eq("id", section.id)
            .single();
            
        const { data: dbWorkout } = await insforgeAdmin.database
            .from("workouts")
            .select("*")
            .eq("id", workout.id)
            .single();

        const { data: dbHabit } = await insforgeAdmin.database
            .from("habits")
            .select("*")
            .eq("id", habit.id)
            .single();

        console.log("DB Section verified:", !!dbSection);
        console.log("DB Workout verified:", !!dbWorkout);
        console.log("DB Habit verified:", !!dbHabit);

        if (dbSection && dbWorkout && dbHabit) {
            testResults.databaseVerification = { status: "passed" };
        } else {
            testResults.databaseVerification = { 
                status: "failed", 
                details: { dbSection: !!dbSection, dbWorkout: !!dbWorkout, dbHabit: !!dbHabit } 
            };
        }

    } catch (err) {
        console.error("\n*** FATAL TEST RUNNER ERROR ***");
        console.error(err);
    }

    console.log("\n==================================================");
    console.log("TESTING SUMMARY:");
    console.log("==================================================");
    let allPassed = true;
    for (const [key, val] of Object.entries(testResults)) {
        console.log(`${key.padEnd(25)}: ${val.status === "passed" ? "✅ PASSED" : "❌ FAILED"} ${val.details ? `(${JSON.stringify(val.details).slice(0, 80)})` : ""}`);
        if (val.status !== "passed") allPassed = false;
    }

    // Write final summary file
    fs.writeFileSync("C:/Users/palga/Documents/Projects_v1/fitness-tracker/test-results-output.json", JSON.stringify(testResults, null, 2));
    
    // Write a markdown report
    let report = `# Fitness Tracker Functional Integration Test Results\n\n`;
    report += `**Timestamp:** ${new Date().toISOString()}\n`;
    report += `**Overall Status:** ${allPassed ? "✅ ALL PASSED" : "❌ SOME FAILED"}\n\n`;
    report += `| Test Case | Status | Details |\n`;
    report += `| --- | --- | --- |\n`;
    for (const [key, val] of Object.entries(testResults)) {
        report += `| ${key} | ${val.status === "passed" ? "✅ PASSED" : "❌ FAILED"} | ${val.details ? JSON.stringify(val.details).slice(0, 150) : "N/A"} |\n`;
    }
    fs.writeFileSync("C:/Users/palga/Documents/Projects_v1/fitness-tracker/test-results-output.md", report);
    console.log("\nSaved test-results-output.json and test-results-output.md");
}

run();
