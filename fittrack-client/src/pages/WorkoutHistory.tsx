import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Clock, Search, Calendar, Dumbbell, CheckCircle2, Circle,
    TrendingUp, BarChart3, Trophy, Bot, AlertTriangle,
    ArrowUpRight, ArrowDownRight, Minus, Loader2,
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import type { Workout, ExerciseSection } from "@/shared/schema";
import ExerciseProgressionChart from "@/components/ExerciseProgressionChart";
import SectionProgressChart from "@/components/SectionProgressChart";

type DateRange = "7" | "30" | "90" | "365" | "all";

interface PlateauResult {
    plateauDetected: boolean;
    summary: string;
    exercises: Array<{
        name: string;
        status: "plateau" | "progressing" | "declining";
        insight: string;
        suggestion: string;
    }>;
    recommendations: string[];
}

interface PersonalRecord {
    exerciseName: string;
    bestWeight: number;
    bestVolume: number; // weight × sets × reps
    bestWeightDate: string;
    bestVolumeDate: string;
    unit: string;
    totalSessions: number;
}

export default function WorkoutHistory() {
    const [dateRange, setDateRange] = useState<DateRange>("90");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSection, setSelectedSection] = useState<string>("all");
    const [selectedExercise, setSelectedExercise] = useState<string>("");

    // Calculate date range
    const { startDate, endDate } = useMemo(() => {
        const end = endOfDay(new Date());
        let start: Date;
        if (dateRange === "all") {
            start = new Date(2020, 0, 1);
        } else {
            start = startOfDay(subDays(new Date(), parseInt(dateRange)));
        }
        return { startDate: start, endDate: end };
    }, [dateRange]);

    // Fetch all workouts
    const { data: workouts = [], isLoading: workoutsLoading } = useQuery<Workout[]>({
        queryKey: ["/api/workouts"],
        queryFn: () => {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
            return apiRequest("GET", `${baseUrl}/api/workouts`).then(res => res.json());
        },
    });

    // Fetch library sections for sidebar
    const { data: librarySections = [] } = useQuery<ExerciseSection[]>({
        queryKey: ["/api/sections/library"],
        queryFn: () => {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
            return apiRequest("GET", `${baseUrl}/api/sections/library`).then(res => res.json());
        },
    });

    const activeSections = librarySections.filter(s => !s.archived);

    // Fetch all sections for name resolution
    const { data: allSections = [] } = useQuery<ExerciseSection[]>({
        queryKey: ["/api/sections"],
        queryFn: () => {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
            return apiRequest("GET", `${baseUrl}/api/sections`).then(res => res.json());
        },
    });

    const getSectionName = (sectionId: string): string => {
        const section = allSections.find(s => s.id === sectionId);
        if (section) return section.name;
        const libSection = librarySections.find(s => s.id === sectionId);
        return libSection?.name || "Unknown Section";
    };

    // Fetch linked section instances for selected library section
    const { data: linkedSectionInstances = [] } = useQuery<ExerciseSection[]>({
        queryKey: ["/api/sections/by-library", selectedSection],
        queryFn: () => {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
            return apiRequest("GET", `${baseUrl}/api/sections/by-library/${selectedSection}`).then(res => res.json());
        },
        enabled: selectedSection !== "all",
    });

    const linkedSectionIds = useMemo(() => {
        return new Set(linkedSectionInstances.map(s => s.id));
    }, [linkedSectionInstances]);

    // Filter workouts
    const filteredWorkouts = useMemo(() => {
        return workouts
            .filter(workout => {
                const workoutDate = new Date(workout.date);
                const inDateRange = workoutDate >= startDate && workoutDate <= endDate;
                const matchesSearch = searchQuery === "" ||
                    workout.exerciseType.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesSection = selectedSection === "all" || linkedSectionIds.has(workout.sectionId);
                return inDateRange && matchesSearch && matchesSection;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [workouts, startDate, endDate, searchQuery, selectedSection, linkedSectionIds]);

    // Compute Personal Records
    const personalRecords = useMemo((): PersonalRecord[] => {
        if (filteredWorkouts.length === 0) return [];

        const exerciseMap = new Map<string, {
            bestWeight: number; bestWeightDate: string;
            bestVolume: number; bestVolumeDate: string;
            unit: string; sessions: Set<string>;
        }>();

        filteredWorkouts.forEach(w => {
            const key = w.exerciseType;
            const volume = w.weight * w.sets * w.reps;
            const existing = exerciseMap.get(key);

            if (!existing) {
                exerciseMap.set(key, {
                    bestWeight: w.weight, bestWeightDate: w.date,
                    bestVolume: volume, bestVolumeDate: w.date,
                    unit: w.unit,
                    sessions: new Set([format(new Date(w.date), "yyyy-MM-dd")]),
                });
            } else {
                if (w.weight > existing.bestWeight) {
                    existing.bestWeight = w.weight;
                    existing.bestWeightDate = w.date;
                }
                if (volume > existing.bestVolume) {
                    existing.bestVolume = volume;
                    existing.bestVolumeDate = w.date;
                }
                existing.sessions.add(format(new Date(w.date), "yyyy-MM-dd"));
            }
        });

        return Array.from(exerciseMap.entries()).map(([name, data]) => ({
            exerciseName: name,
            bestWeight: data.bestWeight,
            bestVolume: data.bestVolume,
            bestWeightDate: data.bestWeightDate,
            bestVolumeDate: data.bestVolumeDate,
            unit: data.unit,
            totalSessions: data.sessions.size,
        })).sort((a, b) => b.totalSessions - a.totalSessions);
    }, [filteredWorkouts]);

    // Exercise types for chart selector
    const exerciseTypes = useMemo(() => {
        const types = new Set(filteredWorkouts.map(w => w.exerciseType));
        return Array.from(types).sort();
    }, [filteredWorkouts]);

    useMemo(() => {
        if (exerciseTypes.length > 0 && !selectedExercise) {
            setSelectedExercise(exerciseTypes[0]);
        }
    }, [exerciseTypes, selectedExercise]);

    const exerciseWorkouts = useMemo(() => {
        if (!selectedExercise) return [];
        return workouts
            .filter(w => w.exerciseType === selectedExercise)
            .filter(w => {
                const wd = new Date(w.date);
                return wd >= startDate && wd <= endDate;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [workouts, selectedExercise, startDate, endDate]);

    // Group workouts by date
    const groupedWorkouts = useMemo(() => {
        const groups: { [key: string]: Workout[] } = {};
        filteredWorkouts.forEach(workout => {
            const dateKey = format(new Date(workout.date), "yyyy-MM-dd");
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(workout);
        });
        return groups;
    }, [filteredWorkouts]);

    // Section workouts for chart
    const sectionWorkouts = useMemo(() => {
        if (selectedSection === "all") return [];
        return filteredWorkouts;
    }, [selectedSection, filteredWorkouts]);

    const selectedSectionName = useMemo(() => {
        if (selectedSection === "all") return "";
        const section = librarySections.find(s => s.id === selectedSection);
        return section?.name || "";
    }, [selectedSection, librarySections]);

    // AI Plateau Detection mutation
    const plateauMutation = useMutation<PlateauResult, Error, string>({
        mutationFn: async (libraryId: string) => {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
            const res = await apiRequest("POST", `${baseUrl}/api/ai/plateau-detection`, { libraryId });
            return res.json();
        },
    });

    const statusIcon = (status: string) => {
        switch (status) {
            case "progressing": return <ArrowUpRight className="h-4 w-4 text-green-500" />;
            case "declining": return <ArrowDownRight className="h-4 w-4 text-red-500" />;
            case "plateau": return <Minus className="h-4 w-4 text-yellow-500" />;
            default: return null;
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case "progressing": return "bg-green-500/10 text-green-600 border-green-500/20";
            case "declining": return "bg-red-500/10 text-red-600 border-red-500/20";
            case "plateau": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
            default: return "";
        }
    };

    if (workoutsLoading) {
        return (
            <div className="space-y-8" data-testid="page-history">
                <div>
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <Clock className="h-8 w-8 text-primary" />
                        Workout History
                    </h1>
                    <p className="text-muted-foreground">Loading your workout history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="page-history">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Clock className="h-8 w-8 text-primary" />
                    Workout History
                </h1>
                <p className="text-muted-foreground">Select a section to view progress, personal records, and AI analysis</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Sidebar — Library Sections */}
                <div className="lg:w-64 shrink-0 space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Library Sections
                    </h3>

                    <button
                        onClick={() => { setSelectedSection("all"); plateauMutation.reset(); }}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                            selectedSection === "all"
                                ? "bg-primary/10 border-primary text-primary font-medium"
                                : "bg-card border-border hover:bg-muted/50"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Dumbbell className="h-4 w-4" />
                            <span>All Sections</span>
                        </div>
                    </button>

                    {activeSections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => { setSelectedSection(section.id); setSelectedExercise(""); plateauMutation.reset(); }}
                            className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                                selectedSection === section.id
                                    ? "bg-primary/10 border-primary text-primary font-medium"
                                    : "bg-card border-border hover:bg-muted/50"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Dumbbell className="h-4 w-4" />
                                <span>{section.name}</span>
                            </div>
                        </button>
                    ))}

                    {activeSections.length === 0 && (
                        <p className="text-sm text-muted-foreground p-4 text-center">
                            No library sections yet. Create one from the Library page.
                        </p>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-6 min-w-0">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="7">Last 7 days</SelectItem>
                                            <SelectItem value="30">Last 30 days</SelectItem>
                                            <SelectItem value="90">Last 90 days</SelectItem>
                                            <SelectItem value="365">Last year</SelectItem>
                                            <SelectItem value="all">All time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                    <Search className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search exercises..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="max-w-sm"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Records */}
                    {personalRecords.length > 0 && (
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    Personal Records
                                    {selectedSection !== "all" && (
                                        <Badge variant="secondary" className="ml-2">{selectedSectionName}</Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {personalRecords.slice(0, 6).map(pr => (
                                        <div key={pr.exerciseName} className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/10">
                                            <p className="font-semibold text-sm mb-2 truncate">{pr.exerciseName}</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Best Weight</span>
                                                    <span className="font-medium">{pr.bestWeight} {pr.unit}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Best Volume</span>
                                                    <span className="font-medium">{pr.bestVolume.toLocaleString()} {pr.unit}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Sessions</span>
                                                    <span className="font-medium">{pr.totalSessions}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Section Progress Chart */}
                    {selectedSection !== "all" && sectionWorkouts.length > 0 && (
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    {selectedSectionName} — Section Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <SectionProgressChart sectionName={selectedSectionName} workouts={sectionWorkouts} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Exercise Progression Charts */}
                    {exerciseTypes.length > 0 && (
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Exercise Progression
                                    </CardTitle>
                                    <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Select exercise" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {exerciseTypes.map(exercise => (
                                                <SelectItem key={exercise} value={exercise}>{exercise}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {exerciseWorkouts.length > 0 ? (
                                    <ExerciseProgressionChart exerciseName={selectedExercise} workouts={exerciseWorkouts} />
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No data for {selectedExercise} in this date range</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* AI Plateau Detection */}
                    {selectedSection !== "all" && (
                        <Card className="border-dashed border-2 border-purple-500/20">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Bot className="h-5 w-5 text-purple-500" />
                                    AI Plateau Detection
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!plateauMutation.data && !plateauMutation.isPending && (
                                    <div className="text-center py-6">
                                        <p className="text-muted-foreground mb-4">
                                            Analyze your {selectedSectionName} workout history for plateaus, stagnation, and get AI-powered recommendations.
                                        </p>
                                        <Button
                                            onClick={() => plateauMutation.mutate(selectedSection)}
                                            className="bg-purple-600 hover:bg-purple-700"
                                            disabled={filteredWorkouts.length < 3}
                                        >
                                            <Bot className="h-4 w-4 mr-2" />
                                            Detect Plateaus
                                        </Button>
                                        {filteredWorkouts.length < 3 && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Need at least 3 workouts for analysis
                                            </p>
                                        )}
                                    </div>
                                )}

                                {plateauMutation.isPending && (
                                    <div className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-3" />
                                        <p className="text-muted-foreground">Analyzing your workout data...</p>
                                    </div>
                                )}

                                {plateauMutation.isError && (
                                    <div className="text-center py-6">
                                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                                        <p className="text-red-500 mb-3">Failed to analyze workouts</p>
                                        <Button
                                            variant="outline"
                                            onClick={() => plateauMutation.mutate(selectedSection)}
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                )}

                                {plateauMutation.data && (
                                    <div className="space-y-4">
                                        {/* Summary */}
                                        <div className={`p-4 rounded-lg border ${
                                            plateauMutation.data.plateauDetected
                                                ? "bg-yellow-500/5 border-yellow-500/20"
                                                : "bg-green-500/5 border-green-500/20"
                                        }`}>
                                            <div className="flex items-start gap-2">
                                                {plateauMutation.data.plateauDetected ? (
                                                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                                ) : (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                                )}
                                                <p className="text-sm">{plateauMutation.data.summary}</p>
                                            </div>
                                        </div>

                                        {/* Exercise Analysis */}
                                        {plateauMutation.data.exercises.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-sm">Exercise Analysis</h4>
                                                {plateauMutation.data.exercises.map((ex, i) => (
                                                    <div key={i} className={`p-3 rounded-lg border ${statusColor(ex.status)}`}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {statusIcon(ex.status)}
                                                            <span className="font-medium text-sm">{ex.name}</span>
                                                            <Badge variant="outline" className="text-xs capitalize ml-auto">
                                                                {ex.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{ex.insight}</p>
                                                        <p className="text-xs mt-1"><strong>Tip:</strong> {ex.suggestion}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Recommendations */}
                                        {plateauMutation.data.recommendations.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-sm">Recommendations</h4>
                                                <ul className="space-y-1">
                                                    {plateauMutation.data.recommendations.map((rec, i) => (
                                                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                            <span className="text-purple-500 mt-1">•</span>
                                                            {rec}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => plateauMutation.mutate(selectedSection)}
                                            className="mt-2"
                                        >
                                            Re-analyze
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Workout Log */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">
                            Workout Log ({filteredWorkouts.length} workouts)
                        </h2>

                        {Object.keys(groupedWorkouts).length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <h3 className="text-lg font-medium mb-2">No workouts found</h3>
                                    <p className="text-muted-foreground">
                                        {searchQuery || selectedSection !== "all"
                                            ? "Try adjusting your filters"
                                            : "Start logging workouts to see them here"}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            Object.entries(groupedWorkouts).map(([dateKey, dayWorkouts]) => (
                                <div key={dateKey} className="space-y-3">
                                    <h3 className="text-sm font-medium text-muted-foreground sticky top-0 bg-background py-2">
                                        {format(new Date(dateKey), "EEEE, MMMM d, yyyy")}
                                    </h3>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {dayWorkouts.map(workout => (
                                            <Card key={workout.id} className="hover:bg-muted/50 transition-colors">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {workout.completed !== false ? (
                                                                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                                                                ) : (
                                                                    <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                                )}
                                                                <span className="font-medium truncate">{workout.exerciseType}</span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground ml-6">
                                                                {workout.sets} sets × {workout.reps} reps @ {workout.weight} {workout.unit}
                                                            </p>
                                                        </div>
                                                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                                                            {getSectionName(workout.sectionId)}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-2 ml-6">
                                                        {format(new Date(workout.date), "h:mm a")}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
