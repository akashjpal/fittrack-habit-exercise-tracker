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
} from "recharts";
import { BarChart3 } from "lucide-react";
import type { Workout } from "@shared/schema";

interface SectionProgressChartProps {
    sectionName: string;
    workouts: Workout[];
}

interface DailyStats {
    date: string;
    fullDate: string;
    totalReps: number;
    maxWeight: number;
    maxWeightExercise: string;
    unit: string;
    exerciseCount: number;
}

export default function SectionProgressChart({
    sectionName,
    workouts
}: SectionProgressChartProps) {
    // Aggregate data by date
    const chartData = useMemo(() => {
        const dailyMap = new Map<string, DailyStats>();

        workouts.forEach(workout => {
            const dateKey = format(new Date(workout.date), "yyyy-MM-dd");
            const existing = dailyMap.get(dateKey);

            const reps = (workout.sets || 0) * (workout.reps || 0);
            const weight = workout.weight || 0;

            if (existing) {
                existing.totalReps += reps;
                if (weight > existing.maxWeight) {
                    existing.maxWeight = weight;
                    existing.maxWeightExercise = workout.exerciseType;
                    existing.unit = workout.unit || "kg";
                }
                existing.exerciseCount += 1;
            } else {
                dailyMap.set(dateKey, {
                    date: format(new Date(workout.date), "MMM d"),
                    fullDate: format(new Date(workout.date), "MMM d, yyyy"),
                    totalReps: reps,
                    maxWeight: weight,
                    maxWeightExercise: workout.exerciseType,
                    unit: workout.unit || "kg",
                    exerciseCount: 1,
                });
            }
        });

        // Sort by date
        return Array.from(dailyMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([_, stats]) => stats);
    }, [workouts]);

    // Get the most common unit
    const unit = workouts[0]?.unit || "kg";

    // Calculate summary stats
    const stats = useMemo(() => {
        if (chartData.length === 0) return null;

        const maxWeights = chartData.map(d => d.maxWeight);
        const totalRepsAll = chartData.reduce((sum, d) => sum + d.totalReps, 0);
        const bestDay = chartData.reduce((best, d) =>
            d.maxWeight > best.maxWeight ? d : best, chartData[0]);

        return {
            peakWeight: Math.max(...maxWeights),
            totalVolume: totalRepsAll,
            workoutDays: chartData.length,
            bestExercise: bestDay?.maxWeightExercise || "N/A",
        };
    }, [chartData]);

    if (chartData.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No data for {sectionName} in this date range</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Summary */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{stats.peakWeight} {unit}</p>
                        <p className="text-xs text-muted-foreground">Peak Weight</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">{stats.totalVolume}</p>
                        <p className="text-xs text-muted-foreground">Total Reps</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">{stats.workoutDays}</p>
                        <p className="text-xs text-muted-foreground">Workout Days</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-lg font-bold truncate" title={stats.bestExercise}>
                            {stats.bestExercise}
                        </p>
                        <p className="text-xs text-muted-foreground">Best Lift</p>
                    </div>
                </div>
            )}

            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Max Weight per Day */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                        Max Weight per Day ({unit})
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
                                    labelFormatter={(label: any) => label}
                                    formatter={(value: any, name: any, props: any) => {
                                        const data = props.payload as DailyStats;
                                        return [`${value} ${data.unit} (${data.maxWeightExercise})`, 'Max Weight'];
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="maxWeight"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Total Reps per Day */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                        Total Reps per Day
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
                                    labelFormatter={(label: any) => label}
                                    formatter={(value: any, name: any, props: any) => {
                                        const data = props.payload as DailyStats;
                                        return [`${value} reps (${data.exerciseCount} exercises)`, 'Total Volume'];
                                    }}
                                />
                                <Bar
                                    dataKey="totalReps"
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
