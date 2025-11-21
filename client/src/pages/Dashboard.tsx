import { useQuery } from "@tanstack/react-query";
import StreakCard from "@/components/StreakCard";
import WeeklyVolumeCard from "@/components/WeeklyVolumeCard";
import SectionProgressCard from "@/components/SectionProgressCard";

interface DashboardData {
  currentStreak: number;
  totalCompletedSets: number;
  totalTargetSets: number;
  sectionProgress: Array<{
    sectionId: string;
    sectionName: string;
    completedSets: number;
    targetSets: number;
    lastWorkout?: string;
  }>;
}

export default function Dashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/analytics/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="space-y-8" data-testid="page-dashboard">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your progress and stay motivated</p>
        </div>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-8" data-testid="page-dashboard">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your progress and stay motivated</p>
        </div>
        <div className="text-muted-foreground">No data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="page-dashboard">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and stay motivated</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StreakCard currentStreak={data.currentStreak} />
        <WeeklyVolumeCard
          completedSets={data.totalCompletedSets}
          targetSets={data.totalTargetSets}
        />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Section Progress</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.sectionProgress.map((section) => (
            <SectionProgressCard
              key={section.sectionId}
              sectionName={section.sectionName}
              completedSets={section.completedSets}
              targetSets={section.targetSets}
              lastWorkout={section.lastWorkout ? new Date(section.lastWorkout) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
