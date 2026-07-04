import ExerciseSectionCard from '../ExerciseSectionCard';

export default function ExerciseSectionCardExample() {
  const mockWorkouts = [
    {
      id: '1',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      exerciseType: 'Bench Press',
      sets: 4,
      reps: 10,
      weight: 60,
      unit: 'kg',
    },
    {
      id: '2',
      date: new Date(Date.now() - 1000 * 60 * 60 * 48),
      exerciseType: 'Incline Dumbbell Press',
      sets: 3,
      reps: 12,
      weight: 25,
      unit: 'kg',
    },
  ];

  return (
    <ExerciseSectionCard
      sectionName="Chest"
      targetSets={12}
      workouts={mockWorkouts}
      onAddWorkout={(workout) => console.log('Adding workout:', workout)}
    />
  );
}
