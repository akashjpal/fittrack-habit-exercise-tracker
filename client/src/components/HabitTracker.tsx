import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { useState } from "react";

interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  completions: Date[];
  streak: number;
}

interface HabitTrackerProps {
  habits: Habit[];
  onToggleCompletion?: (habitId: string, date: Date) => void;
}

export default function HabitTracker({ habits, onToggleCompletion }: HabitTrackerProps) {
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));

  const isCompleted = (habit: Habit, date: Date) => {
    return habit.completions.some(completion => 
      isSameDay(startOfDay(completion), startOfDay(date))
    );
  };

  const handleToggle = (habitId: string, date: Date) => {
    console.log(`Toggling habit ${habitId} for ${format(date, 'yyyy-MM-dd')}`);
    onToggleCompletion?.(habitId, date);
  };

  return (
    <Card data-testid="card-habit-tracker">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Daily Habits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="p-4 rounded-md border border-border bg-card space-y-3"
            data-testid={`habit-${habit.id}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-base">{habit.name}</h4>
                <p className="text-xs text-muted-foreground capitalize">{habit.frequency}</p>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold font-display">{habit.streak}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {last7Days.map((date) => (
                <div key={date.toISOString()} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs text-muted-foreground">
                    {format(date, 'EEE').substring(0, 1)}
                  </span>
                  <Checkbox
                    checked={isCompleted(habit, date)}
                    onCheckedChange={() => handleToggle(habit.id, date)}
                    className="h-8 w-8"
                    data-testid={`checkbox-habit-${habit.id}-${format(date, 'yyyy-MM-dd')}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
