import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Dumbbell, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FitCheckResponse {
    motivation: string;
    strengths: string[];
    weaknesses: string[];
    solutions: string[];
}

export default function AIFitCheck() {
    const { toast } = useToast();
    const [result, setResult] = useState<FitCheckResponse | null>(null);

    const generateMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/ai/fit-check");
            return res.json();
        },
        onSuccess: (data) => {
            setResult(data);
            toast({
                title: "Fit Check Complete",
                description: "Your AI analysis is ready!",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to generate Fit Check. Please try again.",
                variant: "destructive",
            });
        },
    });

    return (
        <div className="space-y-8" data-testid="page-ai-fit-check">
            <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Brain className="h-10 w-10 text-primary" />
                    AI Fit Check
                </h1>
                <p className="text-muted-foreground">
                    Get personalized insights, motivation, and recommendations based on your workout history.
                </p>
            </div>

            {!result && (
                <Card className="border-dashed">
                    <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                        <Brain className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Ready for your Fit Check?</h3>
                        <p className="text-muted-foreground max-w-md mb-6">
                            Our AI will analyze your recent workouts, habits, and progress to provide a comprehensive report on your fitness journey.
                        </p>
                        <Button
                            size="lg"
                            onClick={() => generateMutation.mutate()}
                            disabled={generateMutation.isPending}
                            className="gap-2"
                        >
                            {generateMutation.isPending ? (
                                "Analyzing..."
                            ) : (
                                <>
                                    <Lightbulb className="h-4 w-4" />
                                    Generate Recommendation
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <Lightbulb className="h-5 w-5" />
                                Motivation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-medium italic">"{result.motivation}"</p>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-500">
                                    <TrendingUp className="h-5 w-5" />
                                    Strengths
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside space-y-2">
                                    {result.strengths.map((point, i) => (
                                        <li key={i} className="text-muted-foreground">{point}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-500">
                                    <AlertTriangle className="h-5 w-5" />
                                    Areas for Improvement
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside space-y-2">
                                    {result.weaknesses.map((point, i) => (
                                        <li key={i} className="text-muted-foreground">{point}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-500">
                                <Dumbbell className="h-5 w-5" />
                                Recommended Solutions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2">
                                {result.solutions.map((point, i) => (
                                    <li key={i} className="text-muted-foreground">{point}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <div className="flex justify-center pt-4">
                        <Button
                            variant="outline"
                            onClick={() => generateMutation.mutate()}
                            disabled={generateMutation.isPending}
                        >
                            Regenerate Analysis
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
