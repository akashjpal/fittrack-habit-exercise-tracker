import { useMemo } from "react";
import { format } from "date-fns";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import type { Workout } from "@shared/schema";

interface ExerciseProgressionChartProps {
    exerciseName: string;
    workouts: Workout[];
}

export default function ExerciseProgressionChart({
    exerciseName,
    workouts
}: ExerciseProgressionChartProps) {
    // Prepare chart data
    const chartData = useMemo(() => {
        return workouts.map(workout => ({
            date: format(new Date(workout.date), "MMM d"),
            fullDate: format(new Date(workout.date), "MMM d, yyyy"),
            weight: workout.weight || 0,
            volume: (workout.sets || 0) * (workout.reps || 0),
            sets: workout.sets || 0,
            reps: workout.reps || 0,
            unit: workout.unit || "kg",
        }));
    }, [workouts]);

    // Get the unit from the first workout (assuming consistent units)
    const unit = workouts[0]?.unit || "kg";

    // Calculate stats
    const stats = useMemo(() => {
        if (chartData.length === 0) return null;

        const weights = chartData.map(d => d.weight);
        const volumes = chartData.map(d => d.volume);

        return {
            maxWeight: Math.max(...weights),
            avgWeight: Math.round(weights.reduce((a, b) => a + b, 0) / weights.length),
            totalVolume: volumes.reduce((a, b) => a + b, 0),
            sessions: chartData.length,
        };
    }, [chartData]);

    if (chartData.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No data available for this exercise
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Summary */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{stats.maxWeight} {unit}</p>
                        <p className="text-xs text-muted-foreground">Max Weight</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">{stats.avgWeight} {unit}</p>
                        <p className="text-xs text-muted-foreground">Avg Weight</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">{stats.totalVolume}</p>
                        <p className="text-xs text-muted-foreground">Total Volume</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">{stats.sessions}</p>
                        <p className="text-xs text-muted-foreground">Sessions</p>
                    </div>
                </div>
            )}

            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Weight Progression Chart */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                        Weight Progression ({unit})
                    </h4>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    stroke="hsl(var(--muted-foreground))"
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    stroke="hsl(var(--muted-foreground))"
                                    domain={['dataMin - 5', 'dataMax + 5']}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                    }}
                                    labelFormatter={(label, payload) => {
                                        if (payload && payload[0]) {
                                            return payload[0].payload.fullDate;
                                        }
                                        return label;
                                    }}
                                    formatter={(value: number) => [`${value} ${unit}`, 'Weight']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Volume Chart */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                        Volume (Sets × Reps)
                    </h4>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    stroke="hsl(var(--muted-foreground))"
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    stroke="hsl(var(--muted-foreground))"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                    }}
                                    labelFormatter={(label, payload) => {
                                        if (payload && payload[0]) {
                                            return payload[0].payload.fullDate;
                                        }
                                        return label;
                                    }}
                                    formatter={(value: number, name: string, props: any) => {
                                        const data = props.payload;
                                        return [`${data.sets} sets × ${data.reps} reps = ${value}`, 'Volume'];
                                    }}
                                />
                                <Bar
                                    dataKey="volume"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                    opacity={0.8}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
