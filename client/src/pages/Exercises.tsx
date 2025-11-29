import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import ExerciseSectionCard from "@/components/ExerciseSectionCard";
import AddSectionDialog from "@/components/AddSectionDialog";
import WeekRangeSelector from "@/components/WeekRangeSelector";
import VoiceLogger from "@/components/VoiceLogger";
import type { ExerciseSection, Workout } from "@shared/schema";
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

export default function Exercises() {
  const { toast } = useToast();

  // Week range state (resets to current week on refresh)
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [weekEnd, setWeekEnd] = useState(() => {
    const end = endOfWeek(new Date(), { weekStartsOn: 0 });
    // Set to end of day to include workouts created on Saturday
    end.setHours(23, 59, 59, 999);
    return end;
  });

  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);

  const handleRangeChange = (start: Date, end: Date) => {
    setWeekStart(start);
    setWeekEnd(end);
  };

  const { data: sections, isLoading: sectionsLoading } = useQuery<ExerciseSection[]>({
    queryKey: ["/api/sections", weekStart, weekEnd],
    queryFn: () => {
      const url = new URL(window.location.origin + "/api/sections");
      url.searchParams.set("startDate", weekStart.toISOString());
      url.searchParams.set("endDate", weekEnd.toISOString());
      return apiRequest("GET", url.toString()).then(res => res.json());
    },
  });

  const { data: workouts, isLoading: workoutsLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts/week", weekStart, weekEnd],
    queryFn: () => {
      const url = new URL(window.location.origin + "/api/workouts/week");
      url.searchParams.set("startDate", weekStart.toISOString());
      url.searchParams.set("endDate", weekEnd.toISOString());
      return apiRequest("GET", url.toString()).then(res => res.json());
    },
  });

  const addSectionMutation = useMutation({
    mutationFn: async (section: { name: string; targetSets: number }) => {
      return apiRequest("POST", "/api/sections", {
        ...section,
        date: weekStart.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({
        title: "Section added",
        description: "Your exercise section has been created successfully.",
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
      queryClient.invalidateQueries({ queryKey: ["/api/workouts/week"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/workouts/week"] });
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

  if (sectionsLoading || workoutsLoading) {
    return (
      <div className="space-y-8" data-testid="page-exercises">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Exercise Sections</h1>
            <p className="text-muted-foreground">Log your workouts and track volume by muscle group</p>
          </div>
        </div>
        <div className="text-muted-foreground">Loading...</div>
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



  return (
    <div className="space-y-8" data-testid="page-exercises">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Exercise Sections</h1>
          <p className="text-muted-foreground">Log your workouts and track volume by muscle group</p>
        </div>
        <AddSectionDialog
          onAdd={(section) => addSectionMutation.mutate(section)}
        />
      </div>

      <WeekRangeSelector
        weekStart={weekStart}
        weekEnd={weekEnd}
        onRangeChange={handleRangeChange}
      />

      <VoiceLogger weekStart={weekStart} weekEnd={weekEnd} />

      {sectionsWithWorkouts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No exercise sections yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {sectionsWithWorkouts.map((section) => (
            <ExerciseSectionCard
              key={section.id}
              sectionName={section.name}
              targetSets={section.targetSets}
              workouts={section.workouts}
              onAddWorkout={(workout) => {
                // If adding to a past week, use the start of that week (plus 12 hours to be safe/middle of day)
                // If adding to current week, use current time
                const isCurrentWeek = weekStart <= new Date() && weekEnd >= new Date();
                const workoutDate = isCurrentWeek ? new Date() : new Date(weekStart.getTime() + 12 * 60 * 60 * 1000);

                console.log("Adding workout:", {
                  weekStart: weekStart.toISOString(),
                  isCurrentWeek,
                  calculatedDate: workoutDate.toISOString()
                });

                addWorkoutMutation.mutate({
                  ...workout,
                  sectionId: section.id,
                  date: workoutDate.toISOString(),
                });
              }}
              onDeleteWorkout={(workoutId) => deleteWorkoutMutation.mutate(workoutId)}
              onDeleteSection={() => setSectionToDelete(section.id)}
            />
          ))}
        </div>
      )}

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
