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
import ThemeToggle from "@/components/ThemeToggle";
import { LayoutDashboard, Dumbbell, CheckSquare, TrendingUp } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/exercises" component={Exercises} />
      <Route path="/habits" component={Habits} />
      <Route path="/progress" component={Progress} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Navigation() {
  const [location] = useLocation();

  const links = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/exercises", label: "Exercises", icon: Dumbbell },
    { path: "/habits", label: "Habits", icon: CheckSquare },
    { path: "/progress", label: "Progress", icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 hover-elevate px-2 py-1 rounded-md" data-testid="link-home">
              <Dumbbell className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">FitTrack</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors hover-elevate ${
                      isActive
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
          </div>

          <ThemeToggle />
        </div>

        <nav className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors hover-elevate ${
                  isActive
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
      </div>
    </header>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
