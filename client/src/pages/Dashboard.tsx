import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Target, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
      <div className="space-y-6" data-testid="page-dashboard">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6" data-testid="page-dashboard">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-muted-foreground">No data available</div>
      </div>
    );
  }

  const weeklyPercentage = data.totalTargetSets > 0
    ? Math.round((data.totalCompletedSets / data.totalTargetSets) * 100)
    : 0;

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {/* Streak */}
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Sets */}
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.totalCompletedSets}/{data.totalTargetSets}</p>
              <p className="text-sm text-muted-foreground">Sets This Week</p>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">Weekly Progress</p>
                <p className="text-lg font-bold">{weeklyPercentage}%</p>
              </div>
              <Progress value={weeklyPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Progress - Only show if there are sections */}
      {data.sectionProgress.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Your Sections</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.sectionProgress.map((section) => {
              const percentage = section.targetSets > 0
                ? Math.round((section.completedSets / section.targetSets) * 100)
                : 0;
              return (
                <Card key={section.sectionId} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{section.sectionName}</h3>
                      <span className="text-lg font-bold text-primary">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-1.5 mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{section.completedSets}/{section.targetSets} sets</span>
                      {section.lastWorkout && (
                        <span>{formatDistanceToNow(new Date(section.lastWorkout), { addSuffix: true })}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
