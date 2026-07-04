import AddSectionDialog from '../AddSectionDialog';

export default function AddSectionDialogExample() {
  return (
    <AddSectionDialog
      onAdd={(section) => console.log('Adding section:', section)}
    />
  );
}
