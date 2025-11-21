import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus } from "lucide-react";

interface WorkoutEntryDialogProps {
  sectionName: string;
  onSave?: (workout: {
    exerciseType: string;
    sets: number;
    reps: number;
    weight: number;
    unit: string;
  }) => void;
}

export default function WorkoutEntryDialog({ sectionName, onSave }: WorkoutEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [exerciseType, setExerciseType] = useState("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(20);
  const [unit, setUnit] = useState("kg");

  const handleSave = () => {
    console.log("Saving workout:", { exerciseType, sets, reps, weight, unit });
    onSave?.({ exerciseType, sets, reps, weight, unit });
    setOpen(false);
    setExerciseType("");
    setSets(3);
    setReps(10);
    setWeight(20);
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sets">Sets</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => setSets(Math.max(1, sets - 1))}
                  data-testid="button-decrease-sets"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="sets"
                  type="number"
                  value={sets}
                  onChange={(e) => setSets(Number(e.target.value))}
                  className="text-center"
                  data-testid="input-sets"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => setSets(sets + 1)}
                  data-testid="button-increase-sets"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reps">Reps</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => setReps(Math.max(1, reps - 1))}
                  data-testid="button-decrease-reps"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="reps"
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                  className="text-center"
                  data-testid="input-reps"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => setReps(reps + 1)}
                  data-testid="button-increase-reps"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight</Label>
            <div className="flex gap-2">
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
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
