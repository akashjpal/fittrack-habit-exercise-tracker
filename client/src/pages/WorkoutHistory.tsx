import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { History, Search, Calendar, Dumbbell, CheckCircle2, Circle, TrendingUp, BarChart3 } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import type { Workout, ExerciseSection } from "@shared/schema";
import ExerciseProgressionChart from "@/components/ExerciseProgressionChart";
import SectionProgressChart from "@/components/SectionProgressChart";

type DateRange = "7" | "30" | "90" | "365" | "all";

export default function WorkoutHistory() {
    const [dateRange, setDateRange] = useState<DateRange>("30");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSection, setSelectedSection] = useState<string>("all");
    const [selectedExercise, setSelectedExercise] = useState<string>("");

    // Calculate date range
    const { startDate, endDate } = useMemo(() => {
        const end = endOfDay(new Date());
        let start: Date;

        if (dateRange === "all") {
            start = new Date(2020, 0, 1); // Far in the past
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

    // Fetch library sections for filter dropdown (only library sections, not weekly instances)
    const { data: librarySections = [] } = useQuery<ExerciseSection[]>({
        queryKey: ["/api/sections/library"],
        queryFn: async () => {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
            const res = await apiRequest("GET", `${baseUrl}/api/sections/library`);
            const data = await res.json();
            console.log("Library sections API response:", data);
            return data;
        },
    });

    // Get active (non-archived) library sections for dropdown
    const sections = librarySections.filter(s => !s.archived);
    console.log("Filtered sections for dropdown:", sections);

    // Fetch all sections to resolve names for workouts (weekly section instances)
    const { data: allSections = [] } = useQuery<ExerciseSection[]>({
        queryKey: ["/api/sections"],
        queryFn: () => {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
            return apiRequest("GET", `${baseUrl}/api/sections`).then(res => res.json());
        },
    });

    // Helper: Get section name by ID from all sections
    const getSectionName = (sectionId: string): string => {
        const section = allSections.find(s => s.id === sectionId);
        return section?.name || "Unknown Section";
    };

    // Get unique exercise types for the chart selector
    const exerciseTypes = useMemo(() => {
        const types = new Set(workouts.map(w => w.exerciseType));
        return Array.from(types).sort();
    }, [workouts]);

    // Auto-select first exercise if none selected
    useMemo(() => {
        if (exerciseTypes.length > 0 && !selectedExercise) {
            setSelectedExercise(exerciseTypes[0]);
        }
    }, [exerciseTypes, selectedExercise]);

    // Filter workouts
    const filteredWorkouts = useMemo(() => {
        // Get the selected library section name for matching
        const selectedLibSection = librarySections.find(s => s.id === selectedSection);
        const selectedSectionNameForFilter = selectedLibSection?.name;

        return workouts
            .filter(workout => {
                const workoutDate = new Date(workout.date);
                const inDateRange = workoutDate >= startDate && workoutDate <= endDate;
                const matchesSearch = searchQuery === "" ||
                    workout.exerciseType.toLowerCase().includes(searchQuery.toLowerCase());

                // Match workouts by section name (since weekly sections share the library section's name)
                let matchesSection = selectedSection === "all";
                if (!matchesSection && selectedSectionNameForFilter) {
                    const workoutSectionName = getSectionName(workout.sectionId);
                    matchesSection = workoutSectionName === selectedSectionNameForFilter;
                }

                return inDateRange && matchesSearch && matchesSection;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [workouts, startDate, endDate, searchQuery, selectedSection, librarySections, allSections]);

    // Get workouts for selected exercise (for charts)
    const exerciseWorkouts = useMemo(() => {
        if (!selectedExercise) return [];
        return workouts
            .filter(w => w.exerciseType === selectedExercise)
            .filter(w => {
                const workoutDate = new Date(w.date);
                return workoutDate >= startDate && workoutDate <= endDate;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [workouts, selectedExercise, startDate, endDate]);

    // Group workouts by date
    const groupedWorkouts = useMemo(() => {
        const groups: { [key: string]: Workout[] } = {};
        filteredWorkouts.forEach(workout => {
            const dateKey = format(new Date(workout.date), "yyyy-MM-dd");
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(workout);
        });
        return groups;
    }, [filteredWorkouts]);

    // Get workouts for selected section (for section chart)
    const sectionWorkouts = useMemo(() => {
        if (selectedSection === "all") return [];
        return filteredWorkouts;
    }, [selectedSection, filteredWorkouts]);

    // Get the selected section name
    const selectedSectionName = useMemo(() => {
        if (selectedSection === "all") return "";
        const section = librarySections.find(s => s.id === selectedSection);
        return section?.name || "";
    }, [selectedSection, librarySections]);

    if (workoutsLoading) {
        return (
            <div className="space-y-8" data-testid="page-history">
                <div>
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <History className="h-8 w-8 text-primary" />
                        Workout History
                    </h1>
                    <p className="text-muted-foreground">Loading your workout history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8" data-testid="page-history">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <History className="h-8 w-8 text-primary" />
                    Workout History
                </h1>
                <p className="text-muted-foreground">View your past workouts and track your progress over time</p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                        {/* Date Range */}
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

                        {/* Search */}
                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search exercises..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>

                        {/* Section Filter */}
                        <div className="flex items-center gap-2">
                            <Dumbbell className="h-4 w-4 text-muted-foreground" />
                            <Select value={selectedSection} onValueChange={setSelectedSection}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="All Sections" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sections</SelectItem>
                                    {sections.map(section => (
                                        <SelectItem key={section.id} value={section.id}>
                                            {section.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section Progress Chart - Shows when a specific section is selected */}
            {selectedSection !== "all" && sectionWorkouts.length > 0 && (
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            {selectedSectionName} - Section Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SectionProgressChart
                            sectionName={selectedSectionName}
                            workouts={sectionWorkouts}
                        />
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
                                        <SelectItem key={exercise} value={exercise}>
                                            {exercise}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {exerciseWorkouts.length > 0 ? (
                            <ExerciseProgressionChart
                                exerciseName={selectedExercise}
                                workouts={exerciseWorkouts}
                            />
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No data for {selectedExercise} in this date range</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Workout List */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                    Workout Log ({filteredWorkouts.length} workouts)
                </h2>

                {Object.keys(groupedWorkouts).length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
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
    );
}
