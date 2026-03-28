import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, Calendar, X } from "lucide-react";

interface SetEntry {
  reps: number;
}

interface WorkoutEntryDialogProps {
  sectionName: string;
  onSave?: (workout: {
    exerciseType: string;
    sets: number;
    reps: number;
    weight: number;
    unit: string;
    date: string;
  }) => void;
}

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export default function WorkoutEntryDialog({ sectionName, onSave }: WorkoutEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [exerciseType, setExerciseType] = useState("");
  const [setEntries, setSetEntries] = useState<SetEntry[]>([{ reps: 10 }]);
  const [weight, setWeight] = useState(20);
  const [unit, setUnit] = useState("kg");
  const [workoutDate, setWorkoutDate] = useState(getTodayDate());

  const addSetEntry = () => {
    setSetEntries((prev) => [...prev, { reps: prev[prev.length - 1]?.reps ?? 10 }]);
  };

  const removeSetEntry = (index: number) => {
    setSetEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSetReps = (index: number, reps: number) => {
    setSetEntries((prev) => prev.map((entry, i) => (i === index ? { ...entry, reps } : entry)));
  };

  const handleSave = () => {
    for (const entry of setEntries) {
      onSave?.({ exerciseType, sets: 1, reps: entry.reps, weight, unit, date: workoutDate });
    }
    setOpen(false);
    setExerciseType("");
    setSetEntries([{ reps: 10 }]);
    setWeight(20);
    setWorkoutDate(getTodayDate());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" data-testid="button-add-workout">
          <Plus className="h-4 w-4 mr-2" />
          Log Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Workout - {sectionName}</DialogTitle>
          <DialogDescription>
            Record your exercise details for this session
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="workout-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Workout Date
            </Label>
            <Input
              id="workout-date"
              type="date"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
              data-testid="input-workout-date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise">Exercise Type</Label>
            <Input
              id="exercise"
              placeholder="e.g., Bench Press, Squats"
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value)}
              data-testid="input-exercise-type"
            />
          </div>

          <div className="space-y-3">
            <Label>Sets &amp; Reps</Label>
            <div className="space-y-2">
              {setEntries.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-12 shrink-0">
                    Set {index + 1}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => updateSetReps(index, Math.max(1, entry.reps - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={entry.reps}
                    onChange={(e) => updateSetReps(index, parseInt(e.target.value) || 1)}
                    className="text-center h-8 w-16"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => updateSetReps(index, entry.reps + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm text-muted-foreground">reps</span>
                  {setEntries.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSetEntry(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={addSetEntry}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add More Sets +
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">
              {unit === "min" || unit === "sec" ? "Duration" : "Weight"}
            </Label>
            <div className="flex gap-2">
              <Input
                id="weight"
                type="number"
                step="any"
                min="0"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="flex-1"
                data-testid="input-weight"
              />
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-24" data-testid="select-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                  <SelectItem value="min">min</SelectItem>
                  <SelectItem value="sec">sec</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!exerciseType} data-testid="button-save-workout">
            Save Workout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
