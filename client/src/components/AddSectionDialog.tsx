import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface AddSectionDialogProps {
  onAdd?: (section: { name: string; targetSets: number }) => void;
}

export default function AddSectionDialog({ onAdd }: AddSectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetSets, setTargetSets] = useState(12);

  const handleAdd = () => {
    console.log("Adding section:", { name, targetSets });
    onAdd?.({ name, targetSets });
    setOpen(false);
    setName("");
    setTargetSets(12);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-section">
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Exercise Section</DialogTitle>
          <DialogDescription>
            Create a new muscle group or exercise category to track
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="section-name">Section Name</Label>
            <Input
              id="section-name"
              placeholder="e.g., Chest, Back, Legs, Shoulders"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-section-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="target-sets">Weekly Target Sets</Label>
            <Input
              id="target-sets"
              type="number"
              value={targetSets}
              onChange={(e) => setTargetSets(Number(e.target.value))}
              data-testid="input-target-sets"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-section">
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!name} data-testid="button-save-section">
            Add Section
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
