import { motion } from "framer-motion";
import { createClient } from "@insforge/sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// A dedicated InsForge client in "server mode" so sign-in returns the refresh token in the
// response body (mobile/desktop flow) instead of an httpOnly cookie the browser can't read.
// This is separate from the app's normal `insforge` client used everywhere else.
const oauthInsforge = createClient({
    baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL,
    anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
    isServerMode: true,
});

interface OAuthParams {
    response_type: string | null;
    client_id: string | null;
    redirect_uri: string | null;
    code_challenge: string | null;
    code_challenge_method: string | null;
    state: string | null;
    resource: string | null;
}

function readOAuthParams(): OAuthParams {
    const params = new URLSearchParams(window.location.search);
    return {
        response_type: params.get("response_type"),
        client_id: params.get("client_id"),
        redirect_uri: params.get("redirect_uri"),
        code_challenge: params.get("code_challenge"),
        code_challenge_method: params.get("code_challenge_method"),
        state: params.get("state"),
        resource: params.get("resource"),
    };
}

export default function OAuthAuthorize() {
    const { toast } = useToast();
    const params = useMemo(readOAuthParams, []);
    const isValidRequest =
        params.response_type === "code" &&
        !!params.client_id &&
        !!params.redirect_uri &&
        !!params.code_challenge &&
        params.code_challenge_method === "S256";

    const [step, setStep] = useState<"login" | "consent">("login");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [session, setSession] = useState<{ accessToken: string; refreshToken: string } | null>(null);

    const buildRedirect = (extra: Record<string, string>) => {
        const url = new URL(params.redirect_uri!);
        for (const [key, value] of Object.entries(extra)) url.searchParams.set(key, value);
        return url.toString();
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await oauthInsforge.auth.signInWithPassword({ email, password });
            if (error || !data?.accessToken || !data.refreshToken) {
                toast({
                    title: "Login failed",
                    description: error?.message ?? "Could not start a session for this connection.",
                    variant: "destructive",
                });
                return;
            }
            setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken });
            setStep("consent");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeny = () => {
        const target = buildRedirect(params.state ? { error: "access_denied", state: params.state } : { error: "access_denied" });
        window.location.href = target;
    };

    const handleAllow = async () => {
        if (!session) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/oauth/consent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    access_token: session.accessToken,
                    refresh_token: session.refreshToken,
                    client_id: params.client_id,
                    redirect_uri: params.redirect_uri,
                    code_challenge: params.code_challenge,
                    code_challenge_method: params.code_challenge_method,
                    state: params.state ?? undefined,
                    resource: params.resource ?? undefined,
                    allow: true,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                toast({
                    title: "Could not connect",
                    description: body?.error?.message ?? `Request failed (${res.status})`,
                    variant: "destructive",
                });
                return;
            }

            const body = (await res.json()) as { redirect_uri: string };
            window.location.href = body.redirect_uri;
        } finally {
            setIsLoading(false);
        }
    };

    if (!isValidRequest) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="border-border/50 shadow-xl max-w-md w-full">
                    <CardHeader className="text-center space-y-2">
                        <div className="flex justify-center">
                            <div className="p-3 bg-destructive/10 rounded-full">
                                <AlertTriangle className="w-8 h-8 text-destructive" />
                            </div>
                        </div>
                        <CardTitle>Invalid connection request</CardTitle>
                        <CardDescription>
                            This link is missing required parameters and can't be used to connect an app.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                {step === "login" ? (
                                    <Dumbbell className="w-8 h-8 text-primary" />
                                ) : (
                                    <ShieldCheck className="w-8 h-8 text-primary" />
                                )}
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            {step === "login" ? "Sign in to connect" : "Allow this connection?"}
                        </CardTitle>
                        <CardDescription>
                            {step === "login"
                                ? "Sign in to your FitTrack account to continue."
                                : "This application wants to read and log workouts, habits, and sections on your behalf."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {step === "login" ? (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button className="w-full text-lg h-11" size="lg" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Sign In
                                </Button>
                            </form>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Button className="w-full text-lg h-11" size="lg" disabled={isLoading} onClick={handleAllow}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Allow
                                </Button>
                                <Button variant="outline" className="w-full" disabled={isLoading} onClick={handleDeny}>
                                    Deny
                                </Button>
                            </div>
                        )}
                    </CardContent>
                    {step === "consent" && (
                        <CardFooter className="flex flex-col space-y-2 text-center text-xs text-muted-foreground">
                            <div>Signed in as {email}</div>
                        </CardFooter>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}
