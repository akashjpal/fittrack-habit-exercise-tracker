import AddHabitDialog from '../AddHabitDialog';

export default function AddHabitDialogExample() {
  return (
    <AddHabitDialog
      onAdd={(habit) => console.log('Adding habit:', habit)}
    />
  );
}
