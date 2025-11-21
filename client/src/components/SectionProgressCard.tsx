import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";

interface SectionProgressCardProps {
  sectionName: string;
  completedSets: number;
  targetSets: number;
  lastWorkout?: Date;
}

export default function SectionProgressCard({
  sectionName,
  completedSets,
  targetSets,
  lastWorkout,
}: SectionProgressCardProps) {
  const percentage = Math.round((completedSets / targetSets) * 100);

  return (
    <Card className="hover-elevate" data-testid={`card-section-${sectionName.toLowerCase()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{sectionName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={percentage} className="h-2" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {completedSets}/{targetSets} sets
          </span>
          <span className="text-2xl font-bold font-display text-foreground">
            {percentage}%
          </span>
        </div>
        {lastWorkout && (
          <p className="text-xs text-muted-foreground">
            Last workout: {formatDistanceToNow(lastWorkout, { addSuffix: true })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
