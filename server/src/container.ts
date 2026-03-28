import { InsForgeSectionRepository } from "./repositories/insforge/section.repository";
import { InsForgeWorkoutRepository } from "./repositories/insforge/workout.repository";
import { InsForgeHabitRepository } from "./repositories/insforge/habit.repository";

import { SectionService } from "./services/section.service";
import { WorkoutService } from "./services/workout.service";
import { HabitService } from "./services/habit.service";
import { AnalyticsService } from "./services/analytics.service";
import { AIService } from "./services/ai.service";

import { SectionController } from "./controllers/section.controller";
import { WorkoutController } from "./controllers/workout.controller";
import { HabitController } from "./controllers/habit.controller";
import { AnalyticsController } from "./controllers/analytics.controller";
import { AIController } from "./controllers/ai.controller";

export function bootstrap() {
    // Repositories
    const sectionRepo = new InsForgeSectionRepository();
    const workoutRepo = new InsForgeWorkoutRepository();
    const habitRepo = new InsForgeHabitRepository();

    // Services
    const sectionService = new SectionService(sectionRepo);
    const workoutService = new WorkoutService(workoutRepo);
    const habitService = new HabitService(habitRepo);
    const analyticsService = new AnalyticsService(workoutRepo, sectionRepo, habitRepo);
    const aiService = new AIService(workoutRepo, sectionRepo, habitRepo);

    // Controllers
    const controllers = {
        section: new SectionController(sectionService),
        workout: new WorkoutController(workoutService),
        habit: new HabitController(habitService),
        analytics: new AnalyticsController(analyticsService),
        ai: new AIController(aiService),
    };

    return { controllers };
}
