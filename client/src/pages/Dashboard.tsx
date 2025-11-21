import StreakCard from "@/components/StreakCard";
import WeeklyVolumeCard from "@/components/WeeklyVolumeCard";
import SectionProgressCard from "@/components/SectionProgressCard";
import { subDays } from "date-fns";

export default function Dashboard() {
  const sections = [
    {
      name: "Chest",
      completed: 8,
      target: 12,
      lastWorkout: subDays(new Date(), 1),
    },
    {
      name: "Back",
      completed: 10,
      target: 15,
      lastWorkout: subDays(new Date(), 2),
    },
    {
      name: "Legs",
      completed: 6,
      target: 10,
      lastWorkout: subDays(new Date(), 3),
    },
    {
      name: "Shoulders",
      completed: 5,
      target: 10,
      lastWorkout: subDays(new Date(), 4),
    },
    {
      name: "Arms",
      completed: 7,
      target: 12,
      lastWorkout: subDays(new Date(), 1),
    },
  ];

  const totalCompleted = sections.reduce((sum, s) => sum + s.completed, 0);
  const totalTarget = sections.reduce((sum, s) => sum + s.target, 0);

  return (
    <div className="space-y-8" data-testid="page-dashboard">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and stay motivated</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StreakCard currentStreak={12} />
        <WeeklyVolumeCard completedSets={totalCompleted} targetSets={totalTarget} />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Section Progress</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <SectionProgressCard
              key={section.name}
              sectionName={section.name}
              completedSets={section.completed}
              targetSets={section.target}
              lastWorkout={section.lastWorkout}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
