import { useQuery } from "@tanstack/react-query";
import ProgressChart from "@/components/ProgressChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Calendar } from "lucide-react";

interface ProgressData {
  volumeData: Array<{
    week: string;
    total: number;
    [key: string]: string | number;
  }>;
}

export default function Progress() {
  const { data, isLoading } = useQuery<ProgressData>({
    queryKey: ["/api/analytics/progress"],
  });

  if (isLoading) {
    return (
      <div className="space-y-8" data-testid="page-progress">
        <div>
          <h1 className="text-4xl font-bold mb-2">Progress Analytics</h1>
          <p className="text-muted-foreground">Visualize your training trends and achievements</p>
        </div>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!data || !data.volumeData || data.volumeData.length === 0) {
    return (
      <div className="space-y-8" data-testid="page-progress">
        <div>
          <h1 className="text-4xl font-bold mb-2">Progress Analytics</h1>
          <p className="text-muted-foreground">Visualize your training trends and achievements</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No workout data yet. Start logging workouts to see your progress!</p>
        </div>
      </div>
    );
  }

  const currentWeek = data.volumeData[data.volumeData.length - 1];
  const previousWeek = data.volumeData[data.volumeData.length - 2];
  
  const weeklyChange = previousWeek 
    ? Math.round(((currentWeek.total as number - (previousWeek.total as number)) / (previousWeek.total as number)) * 100)
    : 0;

  const avgSetsPerDay = currentWeek ? ((currentWeek.total as number) / 7).toFixed(1) : "0";

  const trendDirection = data.volumeData.length >= 3
    ? (data.volumeData[data.volumeData.length - 1].total as number) > (data.volumeData[data.volumeData.length - 3].total as number)
      ? "Increasing"
      : "Stable"
    : "Stable";

  const stats = [
    {
      label: "Total Sets This Week",
      value: currentWeek?.total?.toString() || "0",
      icon: Target,
      change: weeklyChange > 0 ? `+${weeklyChange}% from last week` : weeklyChange < 0 ? `${weeklyChange}% from last week` : "Same as last week",
      positive: weeklyChange >= 0,
    },
    {
      label: "Average Sets/Day",
      value: avgSetsPerDay,
      icon: Calendar,
      change: "Based on this week",
      positive: true,
    },
    {
      label: "Current Trend",
      value: trendDirection,
      icon: TrendingUp,
      change: "Last 3 weeks",
      positive: true,
    },
  ];

  // Extract exercise names from data
  const exerciseKeys = Object.keys(currentWeek).filter(key => key !== 'week' && key !== 'total');
  const exerciseCharts = exerciseKeys.map((key, index) => ({
    key,
    color: `hsl(var(--chart-${(index % 5) + 1}))`,
    label: key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
  }));

  return (
    <div className="space-y-8" data-testid="page-progress">
      <div>
        <h1 className="text-4xl font-bold mb-2">Progress Analytics</h1>
        <p className="text-muted-foreground">Visualize your training trends and achievements</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display">{stat.value}</div>
                <p className={`text-xs ${stat.positive ? 'text-primary' : 'text-muted-foreground'} mt-1`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ProgressChart
        data={data.volumeData}
        type="line"
        title="Weekly Volume Trend"
        dataKeys={[
          { key: 'total', color: 'hsl(var(--chart-1))', label: 'Total Sets' },
        ]}
      />

      {exerciseCharts.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Individual Exercise Progress</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            {exerciseCharts.map((exercise) => (
              <ProgressChart
                key={exercise.key}
                data={data.volumeData}
                type="bar"
                title={exercise.label}
                dataKeys={[
                  { key: exercise.key, color: exercise.color, label: exercise.label },
                ]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
