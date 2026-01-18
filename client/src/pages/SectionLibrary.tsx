import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Library, Plus, Archive, ArchiveRestore, Pencil, Trash2, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ExerciseSection } from "@shared/schema";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SectionLibrary() {
    const { toast } = useToast();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editSection, setEditSection] = useState<ExerciseSection | null>(null);
    const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
    const [newSection, setNewSection] = useState({ name: "" });

    // Fetch library sections
    const { data: sections = [], isLoading } = useQuery<ExerciseSection[]>({
        queryKey: ["/api/sections/library"],
        queryFn: () => {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
            return apiRequest("GET", `${baseUrl}/api/sections/library`).then(res => res.json());
        },
    });

    // Create library section
    const createMutation = useMutation({
        mutationFn: async (data: { name: string }) => {
            return apiRequest("POST", "/api/sections/library", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/sections/library"] });
            queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
            setIsAddOpen(false);
            setNewSection({ name: "" });
            toast({
                title: "Section created",
                description: "Your section has been added to the library.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to create section. Please try again.",
                variant: "destructive",
            });
        },
    });

    // Update section
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: { name?: string; archived?: boolean } }) => {
            return apiRequest("PATCH", `/api/sections/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/sections/library"] });
            queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
            setEditSection(null);
            toast({
                title: "Section updated",
                description: "Your changes have been saved.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to update section. Please try again.",
                variant: "destructive",
            });
        },
    });

    // Delete section
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return apiRequest("DELETE", `/api/sections/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/sections/library"] });
            queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
            setSectionToDelete(null);
            toast({
                title: "Section deleted",
                description: "The section has been removed.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to delete section. Please try again.",
                variant: "destructive",
            });
        },
    });

    const handleCreate = () => {
        if (!newSection.name.trim()) {
            toast({ title: "Error", description: "Section name is required.", variant: "destructive" });
            return;
        }
        createMutation.mutate(newSection);
    };

    const handleUpdate = () => {
        if (!editSection) return;
        updateMutation.mutate({
            id: editSection.id,
            data: { name: editSection.name }
        });
    };

    const handleArchive = (section: ExerciseSection) => {
        updateMutation.mutate({
            id: section.id,
            data: { archived: !section.archived }
        });
    };

    const activeSections = sections.filter(s => !s.archived);
    const archivedSections = sections.filter(s => s.archived);

    if (isLoading) {
        return (
            <div className="space-y-8" data-testid="page-library">
                <div>
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <Library className="h-8 w-8 text-primary" />
                        Section Library
                    </h1>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8" data-testid="page-library">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <Library className="h-8 w-8 text-primary" />
                        Section Library
                    </h1>
                    <p className="text-muted-foreground">
                        Create permanent sections to use across all your workouts
                    </p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Section
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Section</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Section Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Chest, Back, Legs"
                                    value={newSection.name}
                                    onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Target sets are configured when you add this section to a week.
                            </p>
                            <Button onClick={handleCreate} className="w-full" disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Creating..." : "Create Section"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Active Sections */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Active Sections ({activeSections.length})</h2>

                {activeSections.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-medium mb-2">No sections yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Create your first section to start organizing your workouts
                            </p>
                            <Button onClick={() => setIsAddOpen(true)} variant="outline" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Section
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {activeSections.map((section) => (
                            <Card key={section.id} className="hover:bg-muted/50 transition-colors">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Dumbbell className="h-4 w-4 text-primary" />
                                            {section.name}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 gap-1"
                                            onClick={() => setEditSection(section)}
                                        >
                                            <Pencil className="h-3 w-3" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1"
                                            onClick={() => handleArchive(section)}
                                        >
                                            <Archive className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                            onClick={() => setSectionToDelete(section.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Archived Sections */}
            {archivedSections.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-muted-foreground">
                        Archived Sections ({archivedSections.length})
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {archivedSections.map((section) => (
                            <Card key={section.id} className="opacity-60 hover:opacity-100 transition-opacity">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Dumbbell className="h-4 w-4" />
                                            {section.name}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-2"
                                        onClick={() => handleArchive(section)}
                                    >
                                        <ArchiveRestore className="h-4 w-4" />
                                        Restore
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editSection} onOpenChange={(open) => !open && setEditSection(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Section</DialogTitle>
                    </DialogHeader>
                    {editSection && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Section Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editSection.name}
                                    onChange={(e) => setEditSection({ ...editSection, name: e.target.value })}
                                />
                            </div>
                            <Button onClick={handleUpdate} className="w-full" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!sectionToDelete} onOpenChange={(open) => !open && setSectionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Section?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this section and all workouts associated with it. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => sectionToDelete && deleteMutation.mutate(sectionToDelete)}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
