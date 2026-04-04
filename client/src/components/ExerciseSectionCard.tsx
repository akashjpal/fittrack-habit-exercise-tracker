import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Dumbbell, Trash2, CheckCircle2, Circle } from "lucide-react";
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
  completed?: boolean;
}

interface ExerciseSectionCardProps {
  sectionName: string;
  targetSets: number;
  workouts: Workout[];
  onAddWorkout?: (workout: Omit<Workout, 'id' | 'date'> & { date: string }) => void;
  onDeleteWorkout?: (workoutId: string) => void;
  onToggleWorkout?: (workoutId: string, completed: boolean) => void;
  onDeleteSection?: () => void;
}

export default function ExerciseSectionCard({
  sectionName,
  targetSets,
  workouts,
  onAddWorkout,
  onDeleteWorkout,
  onToggleWorkout,
  onDeleteSection,
}: ExerciseSectionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const completedSets = workouts.reduce((sum, w) => (w.completed !== false ? sum + w.sets : sum), 0);
  const progress = Math.min(completedSets / targetSets, 1);
  const isComplete = completedSets >= targetSets;

  return (
    <Card
      data-testid={`card-exercise-section-${sectionName.toLowerCase()}`}
      className="overflow-hidden"
    >
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Dumbbell className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-sm truncate">{sectionName}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-xs font-medium tabular-nums ${isComplete ? "text-primary" : "text-muted-foreground"
                }`}
            >
              {completedSets}/{targetSets} sets
            </span>
            {onDeleteSection && (
              <button
                onClick={onDeleteSection}
                className="p-0.5 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Delete section"
                data-testid={`button-delete-section-${sectionName.toLowerCase()}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isComplete ? "bg-primary" : "bg-primary/60"
              }`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Log workout */}
        <WorkoutEntryDialog sectionName={sectionName} onSave={onAddWorkout} />

        {/* Workout list */}
        {workouts.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger
              className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors px-1 pt-0.5"
              data-testid={`button-toggle-workouts-${sectionName.toLowerCase()}`}
            >
              <span>{workouts.length} workout{workouts.length !== 1 ? "s" : ""}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-1.5">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/40 group"
                  data-testid={`workout-entry-${workout.id}`}
                >
                  {onToggleWorkout && (
                    <button
                      onClick={() => onToggleWorkout(workout.id, !(workout.completed ?? true))}
                      className={`shrink-0 transition-colors ${workout.completed !== false
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary"
                        }`}
                    >
                      {workout.completed !== false ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Circle className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                  <span
                    className={`flex-1 text-xs font-medium truncate ${workout.completed === false ? "opacity-60 italic" : ""
                      }`}
                  >
                    {workout.exerciseType}
                    {workout.completed === false && " (Planned)"}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {workout.sets}×{workout.reps} @ {workout.weight} {workout.unit || "kg"}
                  </span>
                  <span className="text-xs text-muted-foreground/60 shrink-0 hidden sm:block">
                    {format(workout.date, "MMM d")}
                  </span>
                  {onDeleteWorkout && (
                    <button
                      onClick={() => onDeleteWorkout(workout.id)}
                      className="opacity-0 group-hover:opacity-100 shrink-0 transition-opacity hover:text-destructive"
                      aria-label="Delete workout"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
