import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, TrendingUp, Brain, Users, Trophy, Mic } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Landing() {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const stagger = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/30 rounded-full blur-3xl"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                    />
                </div>

                <div className="container mx-auto px-4 z-10 relative">
                    <motion.div
                        className="max-w-4xl mx-auto text-center"
                        initial="initial"
                        animate="animate"
                        variants={stagger}
                    >
                        <motion.h1
                            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
                            variants={fadeIn}
                        >
                            Get Fit. Stay Tracked.
                            <br />
                            <span className="text-foreground">Level Up Your Life.</span>
                        </motion.h1>

                        <motion.p
                            className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto"
                            variants={fadeIn}
                        >
                            The ultimate companion for your fitness journey. Track workouts, build habits, and visualize your progress with AI-powered insights.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                            variants={fadeIn}
                        >
                            <Link href="/signup">
                                <Button size="lg" className="text-lg px-8 py-6 h-auto rounded-full group">
                                    Get Started
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto rounded-full">
                                    Log In
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Comprehensive tools to help you reach your fitness goals, all in one place.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Activity,
                                title: "Workout Tracking",
                                description: "Log your exercises, sets, and reps with ease. Keep a detailed history of your fitness journey."
                            },
                            {
                                icon: TrendingUp,
                                title: "Progress Visualization",
                                description: "See your improvements over time with beautiful charts and detailed analytics."
                            },
                            {
                                icon: Brain,
                                title: "AI Insights",
                                description: "Get personalized recommendations and form checks powered by advanced AI."
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 hover:border-primary/50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Upcoming Features */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">Coming Soon</h2>
                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0 text-secondary-foreground">
                                            <Mic className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Voice Logging</h3>
                                            <p className="text-muted-foreground">
                                                Simply speak your workout details, and our AI will automatically log your sets, reps, and weights. No more manual entry needed.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        <div className="flex-1 relative">
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl"
                                animate={{
                                    opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            <div className="relative bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
                                <img
                                    src="/voice-logging.png"
                                    alt="Voice Logging Feature"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
