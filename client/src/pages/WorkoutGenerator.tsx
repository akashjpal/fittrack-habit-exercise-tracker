import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Save, Plus, Trash2, Dumbbell, Loader2, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocation } from "wouter";
import { startOfWeek, endOfWeek } from "date-fns";

interface Exercise {
    name: string;
    sets: number;
    reps: number;
    weight: number;
    unit: string;
    notes?: string;
    completed?: boolean;
}

interface GeneratedWorkout {
    workoutName: string;
    exercises: Exercise[];
}

export default function WorkoutGenerator() {
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [prompt, setPrompt] = useState("");
    const [generatedPlan, setGeneratedPlan] = useState<GeneratedWorkout | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<string>("");

    // Calculate current week range to filter available sections
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }); // Sunday start
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
    weekEnd.setHours(23, 59, 59, 999);

    // Fetch sections for the dropdown (only for current week)
    const { data: sections } = useQuery({
        queryKey: ["/api/sections", weekStart, weekEnd],
        queryFn: async () => {
            const url = new URL("/api/sections", window.location.origin);
            url.searchParams.set("startDate", weekStart.toISOString());
            url.searchParams.set("endDate", weekEnd.toISOString());
            const res = await apiRequest("GET", url.toString());
            return res.json();
        }
    });

    // Mutation to generate workout
    const generateMutation = useMutation({
        mutationFn: async (promptText: string) => {
            const res = await apiRequest("POST", "/api/ai/generate-workout", { prompt: promptText });
            return res.json();
        },
        onSuccess: (data: GeneratedWorkout) => {
            setGeneratedPlan(data);
            toast({
                title: "Workout Generated!",
                description: "Review and edit your workout below.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Generation Failed",
                description: error.message || "Failed to generate workout.",
                variant: "destructive",
            });
        },
    });

    // Mutation to save workout
    const saveMutation = useMutation({
        mutationFn: async (data: { sectionId: string; workouts: Exercise[] }) => {
            const res = await apiRequest("POST", "/api/workouts/batch", data);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Workout Saved as Planned",
                description: "Your workout has been added to your roadmap.",
            });
            setLocation("/exercises");
        },
        onError: (error: any) => {
            toast({
                title: "Save Failed",
                description: error.message || "Failed to save workout.",
                variant: "destructive",
            });
        },
    });

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        generateMutation.mutate(prompt);
    };

    const handleSave = () => {
        if (!generatedPlan || !selectedSectionId) {
            toast({
                title: "Selection Required",
                description: "Please select a workout section.",
                variant: "destructive",
            });
            return;
        }
        saveMutation.mutate({
            sectionId: selectedSectionId,
            workouts: generatedPlan.exercises.map(e => ({ ...e, completed: false })), // Mark as planned
        });
    };

    const updateExercise = (index: number, field: keyof Exercise, value: any) => {
        if (!generatedPlan) return;
        const updatedExercises = [...generatedPlan.exercises];
        updatedExercises[index] = { ...updatedExercises[index], [field]: value };
        setGeneratedPlan({ ...generatedPlan, exercises: updatedExercises });
    };

    const removeExercise = (index: number) => {
        if (!generatedPlan) return;
        const updatedExercises = generatedPlan.exercises.filter((_, i) => i !== index);
        setGeneratedPlan({ ...generatedPlan, exercises: updatedExercises });
    };

    const addExercise = () => {
        if (!generatedPlan) return;
        const newExercise: Exercise = {
            name: "New Exercise",
            sets: 3,
            reps: 10,
            weight: 0,
            unit: "kg",
        };
        setGeneratedPlan({
            ...generatedPlan,
            exercises: [...generatedPlan.exercises, newExercise],
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-primary" />
                    Smart Workout Generator
                </h1>
                <p className="text-muted-foreground">
                    Describe your goal, and let AI build your workout.
                </p>
            </div>

            {/* Input Section */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <Textarea
                            placeholder="E.g., 'High volume leg day focusing on quads', '30 min HIIT cardio', 'Chest and Triceps for hypertrophy'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="min-h-[100px] text-lg"
                        />
                        <Button
                            size="lg"
                            className="w-full gap-2"
                            onClick={handleGenerate}
                            disabled={generateMutation.isPending || !prompt.trim()}
                        >
                            {generateMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Generating Plan...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Generate Workout
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results Section */}
            {generatedPlan && (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
                        <div className="flex-1 w-full">
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-sm font-medium">
                                    Log to Section <span className="text-red-500">*</span>
                                </label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                className="ml-1 p-1 hover:bg-muted rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                aria-label="Info about section availability"
                                            >
                                                <Info className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>Only sections created in the current week are shown here.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a section (e.g., Legs)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.isArray(sections) && sections.map((s: any) => (
                                        <SelectItem key={s.$id} value={s.$id}>
                                            {s.name} ({new Date(s.date).toLocaleDateString()})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{generatedPlan.workoutName}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {generatedPlan.exercises.map((exercise, idx) => (
                                <div key={idx} className="grid gap-4 p-4 border rounded-lg md:grid-cols-[2fr,1fr,1fr,1fr,auto] items-end bg-card hover:bg-accent/5 transition-colors">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Exercise</label>
                                        <Input
                                            value={exercise.name}
                                            onChange={(e) => updateExercise(idx, "name", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Sets</label>
                                        <Input
                                            type="number"
                                            value={exercise.sets}
                                            onChange={(e) => updateExercise(idx, "sets", Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Reps</label>
                                        <Input
                                            type="number"
                                            value={exercise.reps}
                                            onChange={(e) => updateExercise(idx, "reps", Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Weight ({exercise.unit})</label>
                                        <Input
                                            type="number"
                                            value={exercise.weight}
                                            onChange={(e) => updateExercise(idx, "weight", Number(e.target.value))}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive/90"
                                        onClick={() => removeExercise(idx)}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            ))}

                            <Button variant="outline" onClick={addExercise} className="w-full gap-2 border-dashed">
                                <Plus className="h-4 w-4" /> Add Exercise
                            </Button>
                        </CardContent>
                    </Card>

                    <Button
                        size="lg"
                        className="w-full md:w-auto md:min-w-[200px] gap-2"
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                    >
                        {saveMutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save to Workout Log
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
