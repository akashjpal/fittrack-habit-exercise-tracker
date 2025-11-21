import ExerciseSectionCard from "@/components/ExerciseSectionCard";
import AddSectionDialog from "@/components/AddSectionDialog";
import { subDays } from "date-fns";

export default function Exercises() {
  const sections = [
    {
      name: "Chest",
      targetSets: 12,
      workouts: [
        {
          id: '1',
          date: subDays(new Date(), 1),
          exerciseType: 'Bench Press',
          sets: 4,
          reps: 10,
          weight: 60,
          unit: 'kg',
        },
        {
          id: '2',
          date: subDays(new Date(), 3),
          exerciseType: 'Incline Dumbbell Press',
          sets: 3,
          reps: 12,
          weight: 25,
          unit: 'kg',
        },
        {
          id: '3',
          date: subDays(new Date(), 5),
          exerciseType: 'Cable Flyes',
          sets: 3,
          reps: 15,
          weight: 15,
          unit: 'kg',
        },
      ],
    },
    {
      name: "Back",
      targetSets: 15,
      workouts: [
        {
          id: '4',
          date: subDays(new Date(), 2),
          exerciseType: 'Pull-ups',
          sets: 4,
          reps: 8,
          weight: 0,
          unit: 'kg',
        },
        {
          id: '5',
          date: subDays(new Date(), 4),
          exerciseType: 'Barbell Rows',
          sets: 4,
          reps: 10,
          weight: 50,
          unit: 'kg',
        },
      ],
    },
    {
      name: "Legs",
      targetSets: 10,
      workouts: [
        {
          id: '6',
          date: subDays(new Date(), 3),
          exerciseType: 'Squats',
          sets: 4,
          reps: 8,
          weight: 80,
          unit: 'kg',
        },
        {
          id: '7',
          date: subDays(new Date(), 6),
          exerciseType: 'Leg Press',
          sets: 3,
          reps: 12,
          weight: 120,
          unit: 'kg',
        },
      ],
    },
  ];

  return (
    <div className="space-y-8" data-testid="page-exercises">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Exercise Sections</h1>
          <p className="text-muted-foreground">Log your workouts and track volume by muscle group</p>
        </div>
        <AddSectionDialog onAdd={(section) => console.log('Adding section:', section)} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => (
          <ExerciseSectionCard
            key={section.name}
            sectionName={section.name}
            targetSets={section.targetSets}
            workouts={section.workouts}
            onAddWorkout={(workout) => console.log('Adding workout to', section.name, workout)}
          />
        ))}
      </div>
    </div>
  );
}
