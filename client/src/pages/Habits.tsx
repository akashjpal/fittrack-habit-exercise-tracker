import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import HabitTracker from "@/components/HabitTracker";
import AddHabitDialog from "@/components/AddHabitDialog";
import type { Habit, HabitCompletion } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { startOfDay, isSameDay } from "date-fns";

export default function Habits() {
  const { toast } = useToast();

  const { data: habits, isLoading: habitsLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  const { data: completions, isLoading: completionsLoading } = useQuery<HabitCompletion[]>({
    queryKey: ["/api/completions"],
  });

  const addHabitMutation = useMutation({
    mutationFn: async (habit: { name: string; frequency: 'daily' | 'weekly' }) => {
      return apiRequest("POST", "/api/habits", habit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({
        title: "Habit added",
        description: "Your new habit has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: async ({ habitId, date, isCompleted }: { habitId: string; date: Date; isCompleted: boolean }) => {
      if (isCompleted) {
        // Delete completion
        const dateStr = date.toISOString().split('T')[0];
        return apiRequest("DELETE", `/api/completions/${habitId}/${dateStr}`);
      } else {
        // Add completion
        return apiRequest("POST", "/api/completions", {
          habitId,
          date: date.toISOString(),
        });
      }
    },
    onMutate: async ({ habitId, date, isCompleted }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["/api/completions"] });

      // Snapshot the previous value
      const previousCompletions = queryClient.getQueryData<HabitCompletion[]>(["/api/completions"]);

      // Optimistically update to the new value
      queryClient.setQueryData<HabitCompletion[]>(["/api/completions"], (old) => {
        if (!old) return [];

        if (isCompleted) {
          // We are removing a completion (optimistically)
          // Filter out any completion that matches the habitId and date (ignoring time)
          return old.filter(c =>
            !(c.habitId === habitId && isSameDay(startOfDay(new Date(c.date)), startOfDay(date)))
          );
        } else {
          // We are adding a completion (optimistically)
          // Create a temporary completion object
          const newCompletion: HabitCompletion = {
            id: "temp-" + Math.random(), // Temporary ID
            habitId,
            date: startOfDay(date).toISOString(), // Use startOfDay to match backend storage
            // Add other required fields if necessary, or cast as any if strictly typed
          } as any;
          return [...old, newCompletion];
        }
      });

      // Return a context object with the snapshotted value
      return { previousCompletions };
    },
    onError: (err, newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["/api/completions"], context?.previousCompletions);
      toast({
        title: "Error",
        description: "Failed to update habit. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({ queryKey: ["/api/completions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
    },
  });

  if (habitsLoading || completionsLoading) {
    return (
      <div className="space-y-8" data-testid="page-habits">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Habits</h1>
            <p className="text-muted-foreground">Build consistency and track your daily routines</p>
          </div>
        </div>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Calculate streaks for each habit
  const habitsWithData = habits?.map(habit => {
    const habitCompletions = completions?.filter(c => c.habitId === habit.id).map(c => new Date(c.date)) || [];

    // Debug logging
    if (habitCompletions.length > 0) {
      console.log(`Habit ${habit.name} (${habit.id}) has ${habitCompletions.length} completions. Last: ${habitCompletions[habitCompletions.length - 1].toISOString()}`);
    }

    // Calculate streak
    const today = startOfDay(new Date());
    const sortedDates = habitCompletions
      .map(d => startOfDay(d))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      const expected = startOfDay(expectedDate);

      if (sortedDates.some(d => isSameDay(d, expected))) {
        streak++;
      } else {
        break;
      }
    }

    return {
      ...habit,
      completions: habitCompletions,
      streak,
    };
  }) || [];

  const handleToggleCompletion = (habitId: string, date: Date) => {
    const habitCompletions = completions?.filter(c => c.habitId === habitId).map(c => new Date(c.date)) || [];
    const isCompleted = habitCompletions.some(d => isSameDay(startOfDay(d), startOfDay(date)));

    toggleCompletionMutation.mutate({ habitId, date, isCompleted });
  };

  return (
    <div className="space-y-8" data-testid="page-habits">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Habits</h1>
          <p className="text-muted-foreground">Build consistency and track your daily routines</p>
        </div>
        <AddHabitDialog onAdd={(habit) => addHabitMutation.mutate(habit)} />
      </div>

      {habitsWithData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No habits yet. Create one to start building consistency!</p>
        </div>
      ) : (
        <HabitTracker
          habits={habitsWithData}
          onToggleCompletion={handleToggleCompletion}
        />
      )}
    </div>
  );
}
