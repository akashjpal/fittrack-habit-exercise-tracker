import ProgressChart from "@/components/ProgressChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Calendar } from "lucide-react";

export default function Progress() {
  const volumeData = [
    { week: 'Week 1', total: 30, chest: 10, back: 12, legs: 8 },
    { week: 'Week 2', total: 35, chest: 12, back: 13, legs: 10 },
    { week: 'Week 3', total: 42, chest: 14, back: 15, legs: 13 },
    { week: 'Week 4', total: 38, chest: 11, back: 14, legs: 13 },
    { week: 'Week 5', total: 45, chest: 15, back: 16, legs: 14 },
    { week: 'Week 6', total: 48, chest: 16, back: 17, legs: 15 },
  ];

  const stats = [
    {
      label: "Total Sets This Week",
      value: "48",
      icon: Target,
      change: "+12% from last week",
      positive: true,
    },
    {
      label: "Average Sets/Day",
      value: "6.9",
      icon: Calendar,
      change: "+8% from last week",
      positive: true,
    },
    {
      label: "Current Trend",
      value: "Increasing",
      icon: TrendingUp,
      change: "3 weeks upward",
      positive: true,
    },
  ];

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
        data={volumeData}
        type="line"
        title="Weekly Volume Trend"
        dataKeys={[
          { key: 'total', color: 'hsl(var(--chart-1))', label: 'Total Sets' },
        ]}
      />

      <ProgressChart
        data={volumeData}
        type="bar"
        title="Sets by Section"
        dataKeys={[
          { key: 'chest', color: 'hsl(var(--chart-1))', label: 'Chest' },
          { key: 'back', color: 'hsl(var(--chart-2))', label: 'Back' },
          { key: 'legs', color: 'hsl(var(--chart-3))', label: 'Legs' },
        ]}
      />
    </div>
  );
}
