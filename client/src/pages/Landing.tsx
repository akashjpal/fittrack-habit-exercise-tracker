import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, TrendingUp, Brain, Mic, Smartphone, Sparkles } from "lucide-react";
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
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
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
                        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"
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
                        <motion.div variants={fadeIn} className="mb-6 flex justify-center">
                            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                                New: Voice Workout Logging 🎙️
                            </span>
                        </motion.div>

                        <motion.h1
                            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
                            variants={fadeIn}
                        >
                            Fitness Tracking,
                            <br />
                            <span className="text-foreground">Reimagined.</span>
                        </motion.h1>

                        <motion.p
                            className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto"
                            variants={fadeIn}
                        >
                            Experience the future of fitness with AI-powered voice logging, smart analytics, and seamless habit tracking.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                            variants={fadeIn}
                        >
                            <Link href="/signup">
                                <Button size="lg" className="text-lg px-8 py-6 h-auto rounded-full group shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                                    Start Your Journey
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto rounded-full hover:bg-secondary/10">
                                    Log In
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Voice Logging Showcase */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 order-2 md:order-1">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/50 group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <img
                                    src="/voice-logging.png"
                                    alt="Voice Logging Interface"
                                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                            </motion.div>
                        </div>
                        <div className="flex-1 order-1 md:order-2">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary">
                                    <Mic className="w-8 h-8" />
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6">Just Say It. <br />We'll Log It.</h2>
                                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                                    Forget manual entry. With our advanced AI Voice Logger, simply speak your workout details—sets, reps, weights—and watch them instantly transform into structured data.
                                </p>
                                <ul className="space-y-4 mb-8">
                                    {[
                                        "Hands-free logging during workouts",
                                        "Smart parsing of exercise names",
                                        "Automatic date and section matching"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-lg">
                                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Smart Workout Generator Showcase */}
            <section className="py-24 relative overflow-hidden bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 text-purple-500">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6">AI Personal Trainer <br />In Your Pocket.</h2>
                                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                                    Stuck on what to train? Let our Smart Workout Generator build the perfect session for you. Just describe your goal—"Leg day for strength" or "30 min HIIT"—and get a tailored plan instantly.
                                </p>
                                <ul className="space-y-4 mb-8">
                                    {[
                                        "Generates custom workouts in seconds",
                                        "Adapts to your goals and available time",
                                        "Seamlessly adds plans to your schedule"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-lg">
                                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                        <div className="flex-1">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/50 group bg-card p-6"
                            >
                                <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                {/* Mock UI for Generator */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="h-4 w-32 bg-muted rounded animate-pulse mb-1"></div>
                                            <div className="h-3 w-20 bg-muted/50 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-xl space-y-2 border border-border/50">
                                        <div className="h-4 w-3/4 bg-muted rounded"></div>
                                        <div className="h-4 w-1/2 bg-muted rounded"></div>
                                    </div>
                                    <div className="space-y-2">
                                        {[1, 2, 3].map((_, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-card border rounded-lg shadow-sm">
                                                <div className="h-4 w-24 bg-muted rounded"></div>
                                                <div className="h-4 w-16 bg-muted/50 rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-10 w-full bg-primary rounded-lg opacity-90"></div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Fitness Ecosystem</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Everything you need to build healthy habits and crush your goals.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Activity,
                                title: "Smart Tracking",
                                description: "Log exercises, sets, and reps with an intuitive interface designed for speed."
                            },
                            {
                                icon: TrendingUp,
                                title: "Visual Analytics",
                                description: "Track your progress with interactive charts for volume, frequency, and consistency."
                            },
                            {
                                icon: Brain,
                                title: "AI Insights",
                                description: "Get personalized recommendations to optimize your training and recovery."
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-card p-8 rounded-3xl shadow-sm border border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                            >
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Coming Soon */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-secondary/10 to-background border border-secondary/20 rounded-3xl p-12 text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary-foreground text-sm font-medium mb-8">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                                </span>
                                Coming Soon
                            </div>

                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Google Fit Integration</h2>
                            <p className="text-xl text-muted-foreground mb-10">
                                Seamlessly sync your steps, calories, and activity data. Connect your favorite wearables and keep all your health data in one place.
                            </p>

                            <div className="flex justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                <div className="flex items-center gap-2">
                                    <Smartphone className="w-8 h-8" />
                                    <span className="font-semibold text-lg">Google Fit</span>
                                </div>
                                {/* Add more partner logos here if needed */}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
