import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Dumbbell } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import WorkoutEntryDialog from "./WorkoutEntryDialog";

interface Workout {
  id: string;
  date: Date;
  exerciseType: string;
  sets: number;
  reps: number;
  weight: number;
  unit: string;
}

interface ExerciseSectionCardProps {
  sectionName: string;
  targetSets: number;
  workouts: Workout[];
  onAddWorkout?: (workout: Omit<Workout, 'id' | 'date'>) => void;
}

export default function ExerciseSectionCard({
  sectionName,
  targetSets,
  workouts,
  onAddWorkout,
}: ExerciseSectionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const completedSets = workouts.reduce((sum, w) => sum + w.sets, 0);

  return (
    <Card data-testid={`card-exercise-section-${sectionName.toLowerCase()}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            {sectionName}
          </CardTitle>
          <Badge variant="secondary" className="font-display">
            {completedSets}/{targetSets} sets
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <WorkoutEntryDialog sectionName={sectionName} onSave={onAddWorkout} />
        
        {workouts.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover-elevate p-2 rounded-md" data-testid={`button-toggle-workouts-${sectionName.toLowerCase()}`}>
              <span>Recent Workouts ({workouts.length})</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="p-3 rounded-md bg-muted/50 space-y-1"
                  data-testid={`workout-entry-${workout.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{workout.exerciseType}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(workout.date, 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {workout.sets} sets × {workout.reps} reps @ {workout.weight}{workout.unit}
                  </p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
