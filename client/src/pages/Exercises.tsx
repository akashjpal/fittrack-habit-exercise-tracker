import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import ExerciseSectionCard from "@/components/ExerciseSectionCard";
import AddSectionDialog from "@/components/AddSectionDialog";
import type { ExerciseSection, Workout } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Exercises() {
  const { toast } = useToast();

  const { data: sections, isLoading: sectionsLoading } = useQuery<ExerciseSection[]>({
    queryKey: ["/api/sections"],
  });

  const { data: workouts, isLoading: workoutsLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const addSectionMutation = useMutation({
    mutationFn: async (section: { name: string; targetSets: number }) => {
      return apiRequest("POST", "/api/sections", section);
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
    }) => {
      return apiRequest("POST", "/api/workouts", workout);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
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
              onAddWorkout={(workout) =>
                addWorkoutMutation.mutate({
                  ...workout,
                  sectionId: section.id,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
