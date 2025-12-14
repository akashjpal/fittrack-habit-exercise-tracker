import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Exercises from "@/pages/Exercises";
import Habits from "@/pages/Habits";
import Progress from "@/pages/Progress";
import AIFitCheck from "@/pages/AIFitCheck";
import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import WorkoutGenerator from "@/pages/WorkoutGenerator";
import ThemeToggle from "@/components/ThemeToggle";
import { LayoutDashboard, Dumbbell, CheckSquare, TrendingUp, Brain, Loader2, Sparkles } from "lucide-react";
import { AuthProvider, useAuth } from "./lib/auth";
import { GoogleOAuthProvider } from "@react-oauth/google";
import HabitsCommandCenter from "@/pages/HabitsCommandCenter";

function ProtectedRoute({ component: Component, path }: { component: React.ComponentType<any>, path: string }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login but keep the path? For now just simple redirect.
    // Ideally we'd use a Redirect component or useEffect, but returning null + setLocation works in wouter often,
    // though better to render a Redirect component if wouter has one, or just use effect.
    // Wouter doesn't have a Redirect component built-in in v2 usually, but let's check.
    // Safer to just render nothing and redirect.
    setTimeout(() => setLocation("/login"), 0);
    return null;
  }

  return <Route path={path} component={Component} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      {/* Protected Routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/exercises" component={Exercises} />
      <ProtectedRoute path="/habits" component={HabitsCommandCenter} />
      <ProtectedRoute path="/progress" component={Progress} />
      <ProtectedRoute path="/workout-generator" component={WorkoutGenerator} />
      <ProtectedRoute path="/ai-fit-check" component={AIFitCheck} />

      <Route component={NotFound} />
    </Switch>
  );
}

function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  if (['/', '/login', '/signup'].includes(location) && !user) {
    return null;
  }

  if (['/login', '/signup'].includes(location)) {
    return null;
  }

  const links = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/exercises", label: "Exercises", icon: Dumbbell },
    { path: "/habits", label: "Habits", icon: CheckSquare },
    { path: "/progress", label: "Progress", icon: TrendingUp },
    { path: "/workout-generator", label: "Smart Workout", icon: Sparkles },
    { path: "/ai-fit-check", label: "AI Fit Check", icon: Brain },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 hover-elevate px-2 py-1 rounded-md" data-testid="link-home">
              <Dumbbell className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">FitTrack</span>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = location === link.path;
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors hover-elevate ${isActive
                        ? 'text-foreground bg-muted'
                        : 'text-muted-foreground'
                        }`}
                      data-testid={`link-${link.label.toLowerCase()}`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <button
                onClick={logout}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {user && (
          <nav className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors hover-elevate ${isActive
                    ? 'text-foreground bg-muted'
                    : 'text-muted-foreground'
                    }`}
                  data-testid={`link-mobile-${link.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
          <TooltipProvider>
            <div className="min-h-screen bg-background">
              <Navigation />
              <MainLayout />
            </div>
            <Toaster />
          </TooltipProvider>
        </GoogleOAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function MainLayout() {
  const [location] = useLocation();
  const isLanding = location === "/";

  if (isLanding) {
    return <Router />;
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <Router />
    </main>
  );
}

export default App;
