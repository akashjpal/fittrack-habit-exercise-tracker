import { useEffect, useState } from "react";
import { useGoogleTasks, GoogleTask } from "@/hooks/useGoogleTasks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Loader2, LogOut, RefreshCw, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { ArrowRight, Sparkles, PlusCircle, Trash2, Edit2, Save as SaveIcon, X, Lightbulb, TrendingUp, AlertCircle } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function HabitsCommandCenter() {
    const { isAuthenticated, login, logout, getTasks, addTask, getTaskLists, createTaskList, deleteTask, updateTask, toggleTaskStatus, analyzeHabits } = useGoogleTasks();
    const [tasks, setTasks] = useState<GoogleTask[]>([]);
    const [taskLists, setTaskLists] = useState<{ id: string, title: string }[]>([]);
    const [selectedListId, setSelectedListId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    // Manual Add State
    const [manualTaskTitle, setManualTaskTitle] = useState("");
    const [isAddingTask, setIsAddingTask] = useState(false);

    // Edit State
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingTaskTitle, setEditingTaskTitle] = useState("");

    // New List State
    const [newListName, setNewListName] = useState("");
    const [isCreatingList, setIsCreatingList] = useState(false);

    // Generator State
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedHabits, setGeneratedHabits] = useState<string[]>([]);
    const [selectedHabits, setSelectedHabits] = useState<string[]>([]);

    // Insights State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [insights, setInsights] = useState<any>(null);
    const [showInsights, setShowInsights] = useState(false);

    const { toast } = useToast();

    const loadLists = async () => {
        if (!isAuthenticated) return;
        try {
            const res = await getTaskLists();
            setTaskLists(res.items || []);
            // Default to first list or one named "FitTrack"
            if (!selectedListId && res.items?.length > 0) {
                const fitTrackList = res.items.find((l: any) => l.title.includes("FitTrack"));
                const defaultList = fitTrackList || res.items[0];
                setSelectedListId(defaultList.id);
            }
        } catch (error) {
            console.error("Failed to load lists", error);
        }
    };

    const loadTasks = async () => {
        if (!isAuthenticated || !selectedListId) return;
        setIsLoading(true);
        try {
            const fetched = await getTasks(selectedListId);
            setTasks(fetched);
        } catch (error) {
            toast({ title: "Failed to load tasks", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateList = async () => {
        if (!newListName.trim()) return;
        try {
            setIsCreatingList(true);
            const newList = await createTaskList(newListName);
            await loadLists(); // Refresh lists
            setSelectedListId(newList.id); // Switch to new list
            setNewListName("");
            toast({ title: `Created list "${newListName}"` });
        } catch (error) {
            toast({ title: "Failed to create list", variant: "destructive" });
        } finally {
            setIsCreatingList(false);
        }
    };

    const handleAddTask = async () => {
        if (!manualTaskTitle.trim() || !selectedListId) return;
        try {
            setIsAddingTask(true);
            await addTask(manualTaskTitle, "Manually added", selectedListId);
            setManualTaskTitle("");
            await loadTasks();
            toast({ title: "Task added" });
        } catch (error) {
            toast({ title: "Failed to add task", variant: "destructive" });
        } finally {
            setIsAddingTask(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!selectedListId) return;
        try {
            // Optimistic update
            setTasks(prev => prev.filter(t => t.id !== taskId));
            await deleteTask(selectedListId, taskId);
            toast({ title: "Task deleted" });
        } catch (error) {
            toast({ title: "Failed to delete task", variant: "destructive" });
            loadTasks(); // Revert on failure
        }
    };

    const handleToggleStatus = async (task: GoogleTask) => {
        if (!selectedListId) return;
        try {
            // Optimistic update
            const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

            await toggleTaskStatus(selectedListId, task.id, task.status);
        } catch (error) {
            toast({ title: "Failed to update status", variant: "destructive" });
            loadTasks();
        }
    };

    const startEditing = (task: GoogleTask) => {
        setEditingTaskId(task.id);
        setEditingTaskTitle(task.title);
    };

    const cancelEditing = () => {
        setEditingTaskId(null);
        setEditingTaskTitle("");
    };

    const saveEditing = async () => {
        if (!selectedListId || !editingTaskId || !editingTaskTitle.trim()) return;
        try {
            // Optimistic
            setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, title: editingTaskTitle } : t));
            const idToUpdate = editingTaskId; // Capture ref
            setEditingTaskId(null); // Close UI immediately

            await updateTask(selectedListId, idToUpdate, { title: editingTaskTitle });
            toast({ title: "Task updated" });
        } catch (error) {
            toast({ title: "Failed to update task", variant: "destructive" });
            loadTasks();
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadLists();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (selectedListId) {
            loadTasks();
        }
    }, [selectedListId]);

    // Calculate Progress
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <div className="relative p-8 bg-background border rounded-3xl shadow-2xl">
                        <CheckSquare className="h-16 w-16 text-primary" />
                    </div>
                </div>
                <div className="space-y-4 max-w-lg">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Habit Command Center</h1>
                    <p className="text-xl text-muted-foreground">
                        Sync your digital life. Manage daily rituals, track progress, and build consistency with Google Tasks.
                    </p>
                </div>
                <Button size="lg" onClick={() => login()} className="gap-3 text-lg h-14 px-8 rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    Connect Google Tasks
                </Button>
            </div>
        );
    }

    // Recursive render function for tasks and subtasks
    const renderTaskHierarchy = (task: GoogleTask, level = 0) => {
        const subtasks = tasks.filter(t => t.parent === task.id);

        return (
            <div key={task.id} className="space-y-1">
                <div
                    className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 
                        ${task.status === 'completed' ? 'bg-muted/50 border-transparent opacity-80' : 'bg-card border-border hover:border-primary/50 hover:shadow-md'}
                    `}
                    style={{ marginLeft: `${level * 1.5}rem` }}
                >
                    <Checkbox
                        checked={task.status === 'completed'}
                        onCheckedChange={() => handleToggleStatus(task)}
                        id={`task-${task.id}`}
                        className="h-5 w-5 rounded-md border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />

                    {editingTaskId === task.id ? (
                        <div className="flex items-center gap-2 flex-1 animate-in fade-in">
                            <Input
                                value={editingTaskTitle}
                                onChange={(e) => setEditingTaskTitle(e.target.value)}
                                className="h-9"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditing();
                                    if (e.key === 'Escape') cancelEditing();
                                }}
                            />
                            <div className="flex items-center">
                                <Button size="icon" variant="ghost" onClick={saveEditing}>
                                    <SaveIcon className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={cancelEditing}>
                                    <X className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <label
                            htmlFor={`task-${task.id}`}
                            className={`flex-1 cursor-pointer select-none py-1
                                ${task.status === 'completed' ? 'line-through text-muted-foreground decoration-2 decoration-muted-foreground/50' : 'font-medium text-foreground'}
                            `}
                        >
                            {task.title}
                            {task.notes && (
                                <p className="text-xs text-muted-foreground font-normal mt-0.5">{task.notes}</p>
                            )}
                            {task.due && (
                                <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${new Date(task.due) < new Date() ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                    {new Date(task.due).toLocaleDateString()}
                                </span>
                            )}
                        </label>
                    )}

                    {editingTaskId !== task.id && (
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => startEditing(task)}>
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTask(task.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                {/* Render Subtasks */}
                {subtasks.length > 0 && (
                    <div className="border-l-2 border-muted ml-4 pl-0 py-0">
                        {subtasks.map(subtask => renderTaskHierarchy(subtask, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">My Habits</h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1 rounded-full border">
                            <CheckSquare className="h-4 w-4" />
                            {selectedListId ? taskLists.find(l => l.id === selectedListId)?.title : 'Loading...'}
                        </span>
                        <div className="h-1 w-1 bg-muted-foreground/30 rounded-full" />
                        <span className="text-sm">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={selectedListId} onValueChange={setSelectedListId}>
                        <SelectTrigger className="w-[180px] bg-background">
                            <SelectValue placeholder="Select List" />
                        </SelectTrigger>
                        <SelectContent>
                            {taskLists.map(list => (
                                <SelectItem key={list.id} value={list.id}>{list.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon" title="New List">
                                <PlusCircle className="h-5 w-5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New List</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>List Name</Label>
                                    <Input
                                        placeholder="e.g. Morning Routine"
                                        value={newListName}
                                        onChange={(e) => setNewListName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateList} disabled={!newListName.trim() || isCreatingList}>
                                    {isCreatingList && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button variant="ghost" size="icon" onClick={loadTasks} disabled={isLoading} title="Refresh">
                        <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={logout} title="Disconnect">
                        <LogOut className="h-5 w-5" />
                    </Button>

                    <Dialog open={showInsights} onOpenChange={setShowInsights}>
                        <DialogTrigger asChild>
                            <Button
                                className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-md"
                                onClick={async () => {
                                    if (!selectedListId) return;
                                    setIsAnalyzing(true);
                                    setShowInsights(true);
                                    try {
                                        const data = await analyzeHabits(selectedListId);
                                        setInsights(data);
                                    } catch (err) {
                                        toast({ title: "Analysis failed", variant: "destructive" });
                                        setShowInsights(false);
                                    } finally {
                                        setIsAnalyzing(false);
                                    }
                                }}
                            >
                                <Lightbulb className="h-4 w-4" />
                                Insights
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-xl">
                                    <Sparkles className="h-5 w-5 text-indigo-500" />
                                    Smart Habit Insights
                                </DialogTitle>
                            </DialogHeader>

                            {isAnalyzing ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-muted-foreground animate-pulse">Analyzing your patterns and deadlines...</p>
                                </div>
                            ) : insights ? (
                                <div className="space-y-6 py-2">
                                    {/* Positive Patterns */}
                                    <div className="space-y-3">
                                        <h3 className="flex items-center gap-2 font-semibold text-green-600">
                                            <TrendingUp className="h-5 w-5" />
                                            Winning Streaks
                                        </h3>
                                        <div className="grid gap-2">
                                            {insights.positive_patterns?.map((pattern: string, i: number) => (
                                                <div key={i} className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-800 dark:text-green-300">
                                                    {pattern}
                                                </div>
                                            ))}
                                            {!insights.positive_patterns?.length && <p className="text-sm text-muted-foreground italic">Keep tracking to build streaks!</p>}
                                        </div>
                                    </div>

                                    {/* Negative Patterns */}
                                    <div className="space-y-3">
                                        <h3 className="flex items-center gap-2 font-semibold text-orange-600">
                                            <AlertCircle className="h-5 w-5" />
                                            Friction Points
                                        </h3>
                                        <div className="grid gap-2">
                                            {insights.negative_patterns?.map((pattern: string, i: number) => (
                                                <div key={i} className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm text-orange-800 dark:text-orange-300">
                                                    {pattern}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Suggestions */}
                                    <div className="space-y-3">
                                        <h3 className="flex items-center gap-2 font-semibold text-blue-600">
                                            <Lightbulb className="h-5 w-5" />
                                            Coach's Action Plan
                                        </h3>
                                        <div className="grid gap-3">
                                            {insights.suggestions?.map((s: any, i: number) => (
                                                <div key={i} className="flex gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 text-blue-600">
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-blue-900 dark:text-blue-100">{s.habit}</div>
                                                        <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mt-1">{s.tip}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Progress Bar */}
            {totalTasks > 0 && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Daily Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8 items-start">

                {/* Main Task List */}
                <Card className="lg:col-span-2 border shadow-sm h-full flex flex-col">
                    <CardHeader className="border-b bg-muted/40 pb-4">
                        <CardTitle className="flex items-center justify-between">
                            <span>Tasks</span>
                            <span className="text-sm font-normal text-muted-foreground bg-background px-2 py-1 rounded-md border">
                                {completedTasks} / {totalTasks} Done
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 flex flex-col h-[600px]">
                        <div className="p-4 border-b bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50 sticky top-0 z-10">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a new habit..."
                                    value={manualTaskTitle}
                                    onChange={(e) => setManualTaskTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddTask();
                                    }}
                                    className="shadow-sm"
                                />
                                <Button onClick={handleAddTask} disabled={!manualTaskTitle.trim() || isAddingTask} className="shadow-sm">
                                    {isAddingTask ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 px-4 py-2">
                            {tasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 text-muted-foreground">
                                    <div className="p-4 bg-muted rounded-full">
                                        <CheckSquare className="h-8 w-8 opacity-40" />
                                    </div>
                                    <p>No habits yet. Add one above or use the AI Generator!</p>
                                </div>
                            ) : (
                                <div className="space-y-3 pb-4">
                                    {tasks.filter(t => !t.parent).map((task) => renderTaskHierarchy(task))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* AI Generator Side Panel */}
                <Card className="bg-gradient-to-b from-primary/5 to-transparent border-primary/20 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Sparkles className="h-5 w-5" />
                            AI Routine Builder
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Stuck? Let our AI design the perfect routine for your goals.
                        </p>

                        {!generatedHabits.length ? (
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="e.g. 'I want to be more productive in the mornings' or 'Evening relaxation routine'"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="min-h-[120px] bg-background/50 resize-none focus:ring-primary/20"
                                />
                                <Button
                                    className="w-full gap-2 shadow-lg hover:shadow-primary/25 transition-all text-base h-11"
                                    onClick={async () => {
                                        if (!prompt.trim()) return;
                                        setIsGenerating(true);
                                        try {
                                            const res = await apiRequest("POST", "/api/ai/generate-habits", { prompt });
                                            const habits = await res.json();
                                            setGeneratedHabits(habits);
                                            setSelectedHabits(habits);
                                        } catch (err) {
                                            toast({ title: "Failed to generate", variant: "destructive" });
                                        } finally {
                                            setIsGenerating(false);
                                        }
                                    }}
                                    disabled={isGenerating || !prompt.trim()}
                                >
                                    {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                                    Generate Magic
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-xs mb-2">Suggested Habits</div>
                                    {generatedHabits.map((habit, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background border hover:border-primary/30 transition-colors">
                                            <Checkbox
                                                checked={selectedHabits.includes(habit)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) setSelectedHabits([...selectedHabits, habit]);
                                                    else setSelectedHabits(selectedHabits.filter(h => h !== habit));
                                                }}
                                                id={`habit-${idx}`}
                                            />
                                            <label htmlFor={`habit-${idx}`} className="text-sm leading-tight cursor-pointer">
                                                {habit}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button variant="outline" className="flex-1" onClick={() => setGeneratedHabits([])}>
                                        Discard
                                    </Button>
                                    <Button
                                        className="flex-1 gap-2"
                                        disabled={selectedHabits.length === 0 || isLoading}
                                        onClick={async () => {
                                            setIsLoading(true);
                                            try {
                                                let count = 0;
                                                for (const habit of selectedHabits) {
                                                    await addTask(habit, "Generated by FitTrack AI", selectedListId);
                                                    count++;
                                                }
                                                toast({ title: `Added ${count} habits!` });
                                                setGeneratedHabits([]);
                                                setPrompt("");
                                                loadTasks();
                                            } catch (err) {
                                                toast({ title: "Save failed", variant: "destructive" });
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }}
                                    >
                                        Add Selected <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
