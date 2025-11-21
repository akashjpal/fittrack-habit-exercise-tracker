import WorkoutEntryDialog from '../WorkoutEntryDialog';

export default function WorkoutEntryDialogExample() {
  return (
    <WorkoutEntryDialog
      sectionName="Chest"
      onSave={(workout) => console.log('Workout saved:', workout)}
    />
  );
}
