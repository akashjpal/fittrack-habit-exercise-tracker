import ProgressChart from '../ProgressChart';

export default function ProgressChartExample() {
  const mockData = [
    { week: 'Week 1', total: 30, chest: 10, back: 12, legs: 8 },
    { week: 'Week 2', total: 35, chest: 12, back: 13, legs: 10 },
    { week: 'Week 3', total: 42, chest: 14, back: 15, legs: 13 },
    { week: 'Week 4', total: 38, chest: 11, back: 14, legs: 13 },
    { week: 'Week 5', total: 45, chest: 15, back: 16, legs: 14 },
    { week: 'Week 6', total: 48, chest: 16, back: 17, legs: 15 },
  ];

  return (
    <div className="space-y-6">
      <ProgressChart
        data={mockData}
        type="line"
        title="Weekly Volume Trend"
        dataKeys={[
          { key: 'total', color: 'hsl(var(--chart-1))', label: 'Total Sets' },
        ]}
      />
      <ProgressChart
        data={mockData}
        type="bar"
        title="Sets by Section"
        dataKeys={[
          { key: 'chest', color: 'hsl(var(--chart-1))', label: 'Chest' },
          { key: 'back', color: 'hsl(var(--chart-2))', label: 'Back' },
          { key: 'legs', color: 'hsl(var(--chart-3))', label: 'Legs' },
        ]}
      />
    </div>
  );
}
