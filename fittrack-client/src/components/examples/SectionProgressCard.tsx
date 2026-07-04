import SectionProgressCard from '../SectionProgressCard';

export default function SectionProgressCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <SectionProgressCard
        sectionName="Chest"
        completedSets={8}
        targetSets={12}
        lastWorkout={new Date(Date.now() - 1000 * 60 * 60 * 24)}
      />
      <SectionProgressCard
        sectionName="Back"
        completedSets={10}
        targetSets={15}
        lastWorkout={new Date(Date.now() - 1000 * 60 * 60 * 48)}
      />
      <SectionProgressCard
        sectionName="Legs"
        completedSets={6}
        targetSets={10}
        lastWorkout={new Date(Date.now() - 1000 * 60 * 60 * 72)}
      />
    </div>
  );
}
