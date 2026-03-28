import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    Activity,
    TrendingUp,
    Brain,
    Mic,
    Sparkles,
    CheckSquare,
    Dumbbell,
    BarChart3,
    Zap,
    Target,
    Clock,
    Shield,
    Github,
    Heart,
    LayoutDashboard,
    Library
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useRef } from "react";

export default function Landing() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll();
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    const fadeInUp = {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    };

    const staggerContainer = {
        initial: {},
        animate: {
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.1
            }
        }
    };

    const scaleIn = {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    };

    const features = [
        {
            icon: LayoutDashboard,
            title: "Smart Dashboard",
            description: "Get a complete overview of your fitness journey with weekly stats and progress at a glance.",
            color: "from-blue-500 to-cyan-600",
            bgColor: "bg-blue-500/10",
            textColor: "text-blue-500"
        },
        {
            icon: Dumbbell,
            title: "Exercise Tracking",
            description: "Log workouts with voice or text. Track sets, reps, and weight with AI-powered parsing.",
            color: "from-indigo-500 to-blue-600",
            bgColor: "bg-indigo-500/10",
            textColor: "text-indigo-500"
        },
        {
            icon: Library,
            title: "Section Library",
            description: "Organize workouts by muscle group. Create custom sections and reuse them weekly.",
            color: "from-purple-500 to-violet-600",
            bgColor: "bg-purple-500/10",
            textColor: "text-purple-500"
        },
        {
            icon: TrendingUp,
            title: "Progress Analytics",
            description: "Visualize your journey with beautiful charts showing weight and volume trends.",
            color: "from-green-500 to-emerald-600",
            bgColor: "bg-green-500/10",
            textColor: "text-green-500"
        },
        {
            icon: Brain,
            title: "AI Fit Check",
            description: "Get intelligent insights about your training patterns, recovery, and personalized tips.",
            color: "from-pink-500 to-rose-600",
            bgColor: "bg-pink-500/10",
            textColor: "text-pink-500"
        },
        {
            icon: Mic,
            title: "Voice Logging",
            description: "Speak your workout naturally. AI transcribes and structures your data instantly.",
            color: "from-amber-500 to-orange-600",
            bgColor: "bg-amber-500/10",
            textColor: "text-amber-500"
        }
    ];

    const stats = [
        { value: "AI", label: "Powered", icon: Brain },
        { value: "Free", label: "Forever", icon: Heart },
    ];

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* Floating Navigation */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
            >
                <div className="max-w-6xl mx-auto flex items-center justify-between bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl px-6 py-3 shadow-lg shadow-black/5">
                    <Link href="/">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                                <Activity className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-xl">FitTrack</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link href="/login">
                            <Button variant="ghost" className="hidden sm:flex">Log In</Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="rounded-full px-5">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 z-0">
                    <motion.div
                        style={{ y: backgroundY }}
                        className="absolute inset-0"
                    >
                        <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-primary/5 via-primary/10 to-transparent" />
                        <motion.div
                            className="absolute top-20 left-[10%] w-72 h-72 bg-primary/30 rounded-full blur-[100px]"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.5, 0.3],
                                x: [0, 30, 0],
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute top-40 right-[15%] w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.2, 0.4, 0.2],
                                y: [0, -40, 0],
                            }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        />
                        <motion.div
                            className="absolute bottom-20 left-[30%] w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px]"
                            animate={{
                                scale: [1, 1.4, 1],
                                opacity: [0.15, 0.3, 0.15],
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        />
                    </motion.div>

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
                </div>

                <div className="container mx-auto px-4 z-10 relative">
                    <motion.div
                        className="max-w-4xl mx-auto text-center"
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                    >
                        {/* Badge */}
                        <motion.div variants={fadeInUp} className="mb-8">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 text-sm font-medium">
                                <Zap className="w-4 h-4 text-primary" />
                                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                                    AI-Powered Fitness Tracking
                                </span>
                            </span>
                        </motion.div>

                        {/* Main Headline */}
                        <motion.h1
                            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]"
                            variants={fadeInUp}
                        >
                            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                                Train Smarter.
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                Track Better.
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
                            variants={fadeInUp}
                        >
                            Voice-powered workout logging, AI workout generation, and smart analytics
                            to help you build lasting fitness habits.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
                            variants={fadeInUp}
                        >
                            <Link href="/signup">
                                <Button
                                    size="lg"
                                    className="text-lg px-8 py-7 h-auto rounded-full group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                                >
                                    Start Free Today
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="text-lg px-8 py-7 h-auto rounded-full border-2 hover:bg-muted/50"
                                >
                                    Sign In
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-wrap justify-center gap-8 sm:gap-12"
                        >
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-center gap-3"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                                        <stat.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xl font-bold">{stat.value}</div>
                                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                >
                    <motion.div
                        className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="py-24 sm:py-32 relative">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16 sm:mb-20"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-muted text-sm font-medium text-muted-foreground mb-6">
                            Features
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                            Everything You Need to
                            <span className="block bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                                Crush Your Goals
                            </span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            A complete fitness ecosystem powered by AI, designed to make tracking effortless and insights actionable.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                className="group relative bg-card rounded-3xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5"
                            >
                                {/* Gradient overlay on hover */}
                                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                                <div className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 ${feature.textColor} group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>

                                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Voice Logging Showcase */}
            <section className="py-24 sm:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <motion.div
                            className="flex-1 order-2 lg:order-1"
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <div className="relative">
                                {/* Mock Voice UI */}
                                <div className="bg-card rounded-3xl p-8 border border-border shadow-2xl">
                                    <div className="flex items-center gap-4 mb-6">
                                        <motion.div
                                            className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white"
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Mic className="w-8 h-8" />
                                        </motion.div>
                                        <div>
                                            <div className="font-semibold text-lg">Voice Logger</div>
                                            <div className="text-sm text-muted-foreground">Recording...</div>
                                        </div>
                                    </div>

                                    {/* Waveform Animation */}
                                    <div className="flex items-center justify-center gap-1 h-16 mb-6">
                                        {[...Array(20)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-1.5 bg-gradient-to-t from-green-500 to-emerald-400 rounded-full"
                                                animate={{
                                                    height: [20, Math.random() * 40 + 20, 20],
                                                }}
                                                transition={{
                                                    duration: 0.5,
                                                    repeat: Infinity,
                                                    delay: i * 0.05,
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Transcription */}
                                    <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                                        <p className="text-sm text-muted-foreground mb-2">Transcribed:</p>
                                        <p className="font-medium">"3 sets of bench press, 10 reps at 80 kg"</p>
                                    </div>
                                </div>

                                {/* Floating elements */}
                                <motion.div
                                    className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    ✓ Auto-parsed
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="flex-1 order-1 lg:order-2"
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg shadow-green-500/25">
                                <Mic className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                Just Speak.
                                <span className="block text-green-500">We Handle the Rest.</span>
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                Forget manual data entry. Our AI-powered voice logger understands natural language
                                and automatically structures your workout data.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Hands-free logging during workouts",
                                    "Smart exercise name recognition",
                                    "Instant data structuring"
                                ].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        className="flex items-center gap-3"
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 flex-shrink-0">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-lg">{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 sm:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10" />
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
                            Ready to Transform
                            <span className="block bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                Your Fitness Journey?
                            </span>
                        </h2>
                        <p className="text-lg sm:text-xl text-muted-foreground mb-12">
                            Join thousands of users who are training smarter with AI-powered tracking.
                            It's free to start.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/signup">
                                <Button
                                    size="lg"
                                    className="text-lg px-10 py-7 h-auto rounded-full group bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-xl shadow-primary/25"
                                >
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border/50 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                                <Activity className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-lg">FitTrack</span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <a href="https://github.com/akashjpal/fittrack-habit-exercise-tracker" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-2">
                                <Github className="w-4 h-4" />
                                GitHub
                            </a>
                            <span>Built with ❤️ for fitness enthusiasts</span>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} FitTrack. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
