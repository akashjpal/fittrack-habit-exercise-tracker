import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakCardProps {
  currentStreak: number;
}

export default function StreakCard({ currentStreak }: StreakCardProps) {
  const getMessage = () => {
    if (currentStreak === 0) return "Start your journey today!";
    if (currentStreak < 7) return "Keep going!";
    if (currentStreak < 30) return "Great momentum!";
    if (currentStreak < 100) return "You're unstoppable!";
    return "Legendary streak!";
  };

  return (
    <Card data-testid="card-streak">
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="flex items-center gap-3 mb-2">
          <Flame className="h-10 w-10 text-primary" />
          <span className="text-5xl font-bold font-display text-foreground">
            {currentStreak}
          </span>
        </div>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Day Streak
        </p>
        <p className="text-base font-medium text-foreground mt-2">
          {getMessage()}
        </p>
      </CardContent>
    </Card>
  );
}
