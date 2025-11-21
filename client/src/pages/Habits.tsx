import HabitTracker from "@/components/HabitTracker";
import AddHabitDialog from "@/components/AddHabitDialog";
import { subDays } from "date-fns";

export default function Habits() {
  const habits = [
    {
      id: '1',
      name: 'Morning Workout',
      frequency: 'daily' as const,
      completions: [
        new Date(),
        subDays(new Date(), 1),
        subDays(new Date(), 2),
        subDays(new Date(), 3),
        subDays(new Date(), 4),
        subDays(new Date(), 5),
      ],
      streak: 6,
    },
    {
      id: '2',
      name: 'Read 30 Minutes',
      frequency: 'daily' as const,
      completions: [
        new Date(),
        subDays(new Date(), 1),
        subDays(new Date(), 2),
      ],
      streak: 3,
    },
    {
      id: '3',
      name: 'Meditate',
      frequency: 'daily' as const,
      completions: [
        new Date(),
        subDays(new Date(), 1),
      ],
      streak: 2,
    },
    {
      id: '4',
      name: 'Drink 8 Glasses of Water',
      frequency: 'daily' as const,
      completions: [new Date()],
      streak: 1,
    },
  ];

  return (
    <div className="space-y-8" data-testid="page-habits">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Habits</h1>
          <p className="text-muted-foreground">Build consistency and track your daily routines</p>
        </div>
        <AddHabitDialog onAdd={(habit) => console.log('Adding habit:', habit)} />
      </div>

      <HabitTracker
        habits={habits}
        onToggleCompletion={(habitId, date) => console.log('Toggle:', habitId, date)}
      />
    </div>
  );
}
