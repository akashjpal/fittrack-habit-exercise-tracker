import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import ExerciseSectionCard from "@/components/ExerciseSectionCard";
import AddSectionDialog from "@/components/AddSectionDialog";
import WeekRangeSelector from "@/components/WeekRangeSelector";
import VoiceLogger from "@/components/VoiceLogger";
import type { ExerciseSection, Workout } from "@/shared/schema";
import { useToast } from "@/hooks/use-toast";
import { startOfWeek, endOfWeek } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface BatchEntry {
  existing: number;
  target: number;
  adding: number;
  sectionName: string;
  fired: boolean;
}

export default function Exercises() {
  const { toast } = useToast();
  // Tracks sets being added in a single synchronous batch (one dialog save = N onSave calls)
  const pendingBatch = useRef<Map<string, BatchEntry>>(new Map());

  // Week range state (resets to current week on refresh)
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [weekEnd, setWeekEnd] = useState(() => {
    const end = endOfWeek(new Date(), { weekStartsOn: 0 });
    // Set to end of day to include workouts created on Saturday
    end.setHours(23, 59, 59, 999);
    return end;
  });

  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [showEmptySections, setShowEmptySections] = useState(false);

  const handleRangeChange = (start: Date, end: Date) => {
    setWeekStart(start);
    setWeekEnd(end);
  };

  const { data: sections, isLoading: sectionsLoading } = useQuery<ExerciseSection[]>({
    queryKey: ["/api/sections/week", weekStart, weekEnd],
    queryFn: () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
      const url = new URL(baseUrl + "/api/sections/week");
      url.searchParams.set("startDate", weekStart.toISOString());
      url.searchParams.set("endDate", weekEnd.toISOString());
      return apiRequest("GET", url.toString()).then(res => res.json());
    },
  });

  const { data: workouts, isLoading: workoutsLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts/week", weekStart, weekEnd],
    queryFn: () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
      const url = new URL(baseUrl + "/api/workouts/week");
      url.searchParams.set("startDate", weekStart.toISOString());
      url.searchParams.set("endDate", weekEnd.toISOString());
      return apiRequest("GET", url.toString()).then(res => res.json());
    },
  });

  const addSectionMutation = useMutation({
    mutationFn: async (section: { name: string; targetSets: number; librarySectionId?: string }) => {
      return apiRequest("POST", "/api/sections", {
        ...section,
        date: weekStart.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === "/api/sections/week";
        }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({
        title: "Section added",
        description: "Section added to this week.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add section. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addWorkoutMutation = useMutation({
    mutationFn: async (workout: {
      sectionId: string;
      exerciseType: string;
      sets: number;
      reps: number;
      weight: number;
      unit: string;
      date?: string;
    }) => {
      return apiRequest("POST", "/api/workouts", workout);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === "/api/workouts/week";
        }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/progress"] });
      toast({
        title: "Workout logged",
        description: "Your workout has been recorded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log workout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: async (workoutId: string) => {
      return apiRequest("DELETE", `/api/workouts/${workoutId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === "/api/workouts/week";
        }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/progress"] });
      toast({
        title: "Workout deleted",
        description: "Your workout has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete workout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      return apiRequest("DELETE", `/api/sections/${sectionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === "/api/sections/week";
        }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({
        title: "Section deleted",
        description: "Your exercise section has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete section. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleWorkoutStatusMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      return apiRequest("PATCH", `/api/workouts/${id}/status`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === "/api/workouts/week";
        }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/progress"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update workout status.",
        variant: "destructive",
      });
    },
  });

  if (sectionsLoading || workoutsLoading) {
    return (
      <div className="space-y-5" data-testid="page-exercises">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-1">Exercise Sections</h1>
            <p className="text-sm text-muted-foreground">Log workouts and track volume by muscle group</p>
          </div>
        </div>
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  const sectionsWithWorkouts = sections?.map(section => ({
    ...section,
    workouts: workouts?.filter(w => w.sectionId === section.id).map(w => ({
      ...w,
      date: new Date(w.date),
    })) || [],
  })) || [];

  const displayedSections = sectionsWithWorkouts.filter(section => {
    if (showEmptySections) return true;

    // Check if section has workouts in the current filtered view
    const hasWorkouts = section.workouts.length > 0;

    // Check if section was created within the current week range
    const sectionDate = new Date(section.date);
    const createdThisWeek = sectionDate >= weekStart && sectionDate <= weekEnd;

    return hasWorkouts || createdThisWeek;
  });

  // Determine features unlocked by milestone
  // Once the user has added at least one manual workout in *any* section this week, unlock voice logging
  const hasLoggedAnyWorkout = displayedSections.some(s => s.workouts.length > 0);

  return (
    <div className="space-y-5" data-testid="page-exercises">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold mb-1">Exercise Sections</h1>
          <p className="text-sm text-muted-foreground">Log workouts and track volume by muscle group</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="show-empty"
              checked={showEmptySections}
              onCheckedChange={setShowEmptySections}
            />
            <Label htmlFor="show-empty" className="text-sm text-muted-foreground">
              Show hidden
            </Label>
          </div>
          <AddSectionDialog
            onAdd={(section) => addSectionMutation.mutate(section)}
          />
        </div>
      </div>

      <WeekRangeSelector
        weekStart={weekStart}
        weekEnd={weekEnd}
        onRangeChange={handleRangeChange}
      />

      {/* Two-panel layout: sidebar + sections */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Voice Logger — above sections on mobile, right sidebar on desktop */}
        <div className="w-full lg:w-72 lg:order-2 lg:shrink-0 lg:sticky lg:top-24">
          {hasLoggedAnyWorkout ? (
            <VoiceLogger weekStart={weekStart} weekEnd={weekEnd} />
          ) : (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 flex flex-col items-center text-center gap-2">
              <span className="text-2xl">🎙️</span>
              <h3 className="font-semibold text-sm">Unlock Voice Logging</h3>
              <p className="text-muted-foreground text-xs">
                Log your first workout this week to unlock AI hands-free voice logging.
              </p>
            </div>
          )}
        </div>

        {/* Sections grid */}
        <div className="lg:order-1 flex-1 min-w-0">
          {displayedSections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No active exercise sections for this week.</p>
              <p className="text-xs text-muted-foreground">Toggle "Show hidden" to see older sections.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {displayedSections.map((section) => (
                <ExerciseSectionCard
                  key={section.id}
                  sectionName={section.name}
                  targetSets={section.targetSets ?? 10}
                  workouts={section.workouts}
                  onAddWorkout={(workout) => {
                    const targetSets = section.targetSets ?? 10;

                    // Accumulate sets from this synchronous batch (dialog fires onSave once per set entry)
                    if (!pendingBatch.current.has(section.id)) {
                      const existingCompleted = section.workouts.reduce(
                        (sum, w) => (w.completed !== false ? sum + w.sets : sum), 0
                      );
                      pendingBatch.current.set(section.id, {
                        existing: existingCompleted,
                        target: targetSets,
                        adding: 0,
                        sectionName: section.name,
                        fired: false,
                      });
                    }

                    const batch = pendingBatch.current.get(section.id)!;
                    batch.adding += workout.completed !== false ? workout.sets : 0;

                    // Check milestone after the synchronous loop finishes (all onSave calls complete)
                    setTimeout(() => {
                      if (
                        !batch.fired &&
                        batch.existing < batch.target &&
                        batch.existing + batch.adding >= batch.target
                      ) {
                        batch.fired = true;
                        import("canvas-confetti").then((confetti) => {
                          confetti.default({
                            particleCount: 180,
                            spread: 90,
                            origin: { y: 0.6 },
                            colors: ["#22c55e", "#10b981", "#166534", "#86efac"],
                          });
                        });
                        toast({
                          title: "🎉 Target Reached!",
                          description: `Awesome! You hit your ${batch.target} sets target for ${batch.sectionName}!`,
                        });
                      }
                      pendingBatch.current.delete(section.id);
                    }, 0);

                    // Use the date from the workout dialog (user-selected)
                    const workoutDate = workout.date
                      ? new Date(workout.date + 'T12:00:00')
                      : new Date();

                    addWorkoutMutation.mutate({
                      ...workout,
                      sectionId: section.id,
                      date: workoutDate.toISOString(),
                    });
                  }}
                  onDeleteWorkout={(workoutId) => deleteWorkoutMutation.mutate(workoutId)}
                  onToggleWorkout={(workoutId, completed) => toggleWorkoutStatusMutation.mutate({ id: workoutId, completed })}
                  onDeleteSection={() => setSectionToDelete(section.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!sectionToDelete} onOpenChange={(open) => !open && setSectionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this exercise section and all workouts contained within it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (sectionToDelete) {
                  deleteSectionMutation.mutate(sectionToDelete);
                  setSectionToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
