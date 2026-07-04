import HabitTracker from '../HabitTracker';
import { subDays } from 'date-fns';

export default function HabitTrackerExample() {
  const mockHabits = [
    {
      id: '1',
      name: 'Morning Workout',
      frequency: 'daily' as const,
      completions: [
        new Date(),
        subDays(new Date(), 1),
        subDays(new Date(), 2),
        subDays(new Date(), 3),
      ],
      streak: 4,
    },
    {
      id: '2',
      name: 'Read 30 Minutes',
      frequency: 'daily' as const,
      completions: [
        new Date(),
        subDays(new Date(), 1),
      ],
      streak: 2,
    },
    {
      id: '3',
      name: 'Meditate',
      frequency: 'daily' as const,
      completions: [new Date()],
      streak: 1,
    },
  ];

  return (
    <HabitTracker
      habits={mockHabits}
      onToggleCompletion={(habitId, date) => 
        console.log('Toggle habit:', habitId, date)
      }
    />
  );
}
