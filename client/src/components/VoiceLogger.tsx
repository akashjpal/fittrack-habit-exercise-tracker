import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import type { ExerciseSection } from "@shared/schema";
import { startOfWeek, endOfWeek } from "date-fns";

interface VoiceLoggerProps {
    weekStart: Date;
    weekEnd: Date;
}

export default function VoiceLogger({ weekStart, weekEnd }: VoiceLoggerProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedSectionId, setSelectedSectionId] = useState<string>("");
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: sections } = useQuery<ExerciseSection[]>({
        queryKey: ["/api/sections", weekStart, weekEnd],
        queryFn: () => {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
            const url = new URL(baseUrl + "/api/sections");
            url.searchParams.set("startDate", weekStart.toISOString());
            url.searchParams.set("endDate", weekEnd.toISOString());
            return apiRequest("GET", url.toString()).then(res => res.json());
        },
    });

    // Reset selection if the selected section is not in the current week's sections
    useEffect(() => {
        if (sections) {
            const isValidSection = sections.find(s => s.id === selectedSectionId);
            if (!isValidSection) {
                setSelectedSectionId("");
            }
        }
    }, [sections, selectedSectionId]);

    const startRecording = async () => {
        if (!selectedSectionId) {
            toast({
                title: "Select a Section",
                description: "Please select a workout section (e.g., Legs, Push) before recording.",
                variant: "destructive",
            });
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
                await processAudio(audioBlob);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            toast({
                title: "Microphone Error",
                description: "Could not access microphone. Please check permissions.",
                variant: "destructive",
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const processAudio = async (audioBlob: Blob) => {
        setIsProcessing(true);
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        formData.append("sectionId", selectedSectionId);

        // Calculate date: if current week, use now; otherwise use middle of start day
        const isCurrentWeek = weekStart <= new Date() && weekEnd >= new Date();
        const workoutDate = isCurrentWeek ? new Date() : new Date(weekStart.getTime() + 12 * 60 * 60 * 1000);
        formData.append("date", workoutDate.toISOString());

        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
            const response = await fetch(`${baseUrl}/api/voice-log`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to process voice log");
            }

            const data = await response.json();

            toast({
                title: "Workout Logged!",
                description: `Logged ${data.workouts.length} exercises to section.`,
            });

            // Invalidate queries to refresh the list
            queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
            queryClient.invalidateQueries({ queryKey: ["/api/workouts/week"] });
            queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });

        } catch (error: any) {
            console.error("Voice processing error:", error);
            toast({
                title: "Processing Failed",
                description: error.message || "Could not process your voice note.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Card className="w-full bg-gradient-to-br from-primary/5 to-secondary/5 border-none shadow-sm mb-6">
            <CardContent className="p-6 flex flex-col items-center justify-center gap-6">
                <div className="text-center space-y-2">
                    <h3 className="font-semibold text-lg">Voice Logging</h3>
                    <p className="text-sm text-muted-foreground">
                        Select a section, tap the mic, and say your workout details.
                    </p>
                </div>

                <div className="w-full max-w-xs">
                    <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Section (e.g., Legs)" />
                        </SelectTrigger>
                        <SelectContent>
                            {sections?.map((section) => (
                                <SelectItem key={section.id} value={section.id}>
                                    {section.name}
                                </SelectItem>
                            ))}
                            {(!sections || sections.length === 0) && (
                                <div className="p-2 text-sm text-muted-foreground text-center">
                                    No sections found for this week.
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        {isProcessing ? (
                            <motion.div
                                key="processing"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center"
                            >
                                <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                            </motion.div>
                        ) : isRecording ? (
                            <motion.div
                                key="recording"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="relative"
                            >
                                <motion.div
                                    className="absolute inset-0 bg-red-500 rounded-full opacity-20"
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                />
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="w-16 h-16 rounded-full relative z-10"
                                    onClick={stopRecording}
                                >
                                    <Square className="w-6 h-6 fill-current" />
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                            >
                                <Button
                                    size="icon"
                                    className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                                    onClick={startRecording}
                                    disabled={!selectedSectionId}
                                >
                                    <Mic className="w-8 h-8" />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {isRecording && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="text-sm font-medium text-red-500 animate-pulse"
                        >
                            Recording...
                        </motion.p>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
