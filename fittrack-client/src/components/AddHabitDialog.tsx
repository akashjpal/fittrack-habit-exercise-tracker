import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface AddHabitDialogProps {
  onAdd?: (habit: { name: string; frequency: 'daily' | 'weekly' }) => void;
}

export default function AddHabitDialog({ onAdd }: AddHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  const handleAdd = () => {
    console.log("Adding habit:", { name, frequency });
    onAdd?.({ name, frequency });
    setOpen(false);
    setName("");
    setFrequency('daily');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-habit">
          <Plus className="h-4 w-4 mr-2" />
          Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogDescription>
            Create a new habit to track your progress
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Habit Name</Label>
            <Input
              id="habit-name"
              placeholder="e.g., Morning Run, Read 30 Minutes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-habit-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(val) => setFrequency(val as 'daily' | 'weekly')}>
              <SelectTrigger id="frequency" data-testid="select-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-habit">
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!name} data-testid="button-save-habit">
            Add Habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
