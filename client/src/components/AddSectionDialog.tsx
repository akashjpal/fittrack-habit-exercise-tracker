import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Library } from "lucide-react";
import type { ExerciseSection } from "@shared/schema";
import { Link } from "wouter";

interface AddSectionDialogProps {
  onAdd?: (section: { name: string; targetSets: number; librarySectionId: string }) => void;
}

export default function AddSectionDialog({ onAdd }: AddSectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [targetSets, setTargetSets] = useState(10);

  // Fetch active library sections for dropdown
  const { data: librarySections = [], isLoading } = useQuery<ExerciseSection[]>({
    queryKey: ["/api/sections/library/active"],
    queryFn: () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
      return apiRequest("GET", `${baseUrl}/api/sections/library/active`).then(res => res.json());
    },
    enabled: open, // Only fetch when dialog is open
  });

  const selectedSection = librarySections.find(s => s.id === selectedSectionId);

  const handleAdd = () => {
    if (!selectedSection) return;
    onAdd?.({
      name: selectedSection.name,
      targetSets,
      librarySectionId: selectedSection.id
    });
    setOpen(false);
    setSelectedSectionId("");
    setTargetSets(10);
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
          <DialogTitle>Add Section to This Week</DialogTitle>
          <DialogDescription>
            Select a section from your library to add to this week
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="library-section">Library Section</Label>
            {isLoading ? (
              <div className="text-sm text-muted-foreground py-2">Loading sections...</div>
            ) : librarySections.length === 0 ? (
              <div className="text-sm text-muted-foreground py-2 space-y-2">
                <p>No sections in library yet.</p>
                <Link href="/library">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(false)}>
                    <Library className="h-4 w-4" />
                    Go to Library
                  </Button>
                </Link>
              </div>
            ) : (
              <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
                <SelectTrigger id="library-section" data-testid="select-library-section">
                  <SelectValue placeholder="Select a section..." />
                </SelectTrigger>
                <SelectContent>
                  {librarySections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedSectionId && (
            <div className="space-y-2">
              <Label htmlFor="target-sets">Target Sets This Week</Label>
              <Input
                id="target-sets"
                type="number"
                min={1}
                value={targetSets}
                onChange={(e) => setTargetSets(Number(e.target.value) || 10)}
                data-testid="input-target-sets"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-section">
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedSectionId} data-testid="button-save-section">
            Add to Week
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
