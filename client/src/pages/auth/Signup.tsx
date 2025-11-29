import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, ArrowLeft } from "lucide-react";

export default function Signup() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-tl from-primary/5 via-background to-background" />
                <motion.div
                    className="absolute bottom-0 right-0 w-full h-full opacity-30"
                    style={{
                        backgroundImage: "radial-gradient(circle at 80% 80%, rgba(var(--primary-rgb), 0.1) 0%, transparent 50%)",
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <Link href="/landing" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>

                <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Dumbbell className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">Join the Movement</CardTitle>
                        <CardDescription>
                            Create an account to start your fitness journey
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First name</Label>
                                <Input id="firstName" placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last name</Label>
                                <Input id="lastName" placeholder="Doe" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input id="confirmPassword" type="password" />
                        </div>
                        <Button className="w-full text-lg h-11" size="lg">
                            Create Account
                        </Button>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
                        <div>
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary font-medium hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
