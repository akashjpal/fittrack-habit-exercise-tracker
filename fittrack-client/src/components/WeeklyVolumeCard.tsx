import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface WeeklyVolumeCardProps {
  completedSets: number;
  targetSets: number;
}

export default function WeeklyVolumeCard({ completedSets, targetSets }: WeeklyVolumeCardProps) {
  const percentage = targetSets > 0 ? Math.round((completedSets / targetSets) * 100) : 0;

  return (
    <Card data-testid="card-weekly-volume">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Weekly Volume</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(percentage / 100) * 351.86} 351.86`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold font-display text-foreground">
              {percentage}%
            </span>
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {completedSets}/{targetSets} sets completed this week
        </p>
      </CardContent>
    </Card>
  );
}
