import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import insforge from "./insforge";
import { queryClient } from "./queryClient";
import { setAccessToken } from "./tokenStore";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<{ requireVerification: boolean }>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithOAuth: (provider: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check session on mount (getCurrentUser awaits any pending OAuth callback)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await insforge.auth.getCurrentUser();
        if (data?.user) {
          const u = data.user;
          if (u) {
            setUser({ id: u.id, email: u.email, name: u.profile?.name });
          }
          // Recover the access token for API calls (after OAuth or page reload)
          const { data: refreshed } = await insforge.auth.refreshSession();
          if (refreshed?.accessToken) setAccessToken(refreshed.accessToken);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();

    const handleUnauthorized = () => {
      setUser(null);
      queryClient.clear();
      setLocation("/");
      toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      throw error;
    }
    if (data?.user) {
      setUser({ id: data.user.id, email: data.user.email, name: data.user.profile?.name });
      setAccessToken((data as any).session?.access_token || data.accessToken || null);
    }
    toast({ title: "Welcome back!", description: "Logged in successfully." });
    setLocation("/dashboard");
  }, [setLocation, toast]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { data, error } = await insforge.auth.signUp({ email, password, name });
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      throw error;
    }

    if (data?.requireEmailVerification) {
      toast({ title: "Check your email", description: "We sent a verification code." });
      return { requireVerification: true };
    }

    // No verification needed - user is signed in
    if (data?.user) {
      setUser({ id: data.user.id, email: data.user.email, name: data.user.profile?.name });
      setLocation("/dashboard");
    }
    return { requireVerification: false };
  }, [setLocation, toast]);

  const verifyEmail = useCallback(async (email: string, otp: string) => {
    const { data, error } = await insforge.auth.verifyEmail({ email, otp });
    if (error) {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
      throw error;
    }
    if (data?.user) {
      setUser({ id: data.user.id, email: data.user.email, name: data.user.profile?.name });
      setAccessToken((data as any).session?.access_token || data.accessToken || null);
    }
    toast({ title: "Welcome!", description: "Account verified successfully." });
    setLocation("/dashboard");
  }, [setLocation, toast]);

  const signInWithOAuth = useCallback(async (provider: string) => {
    await insforge.auth.signInWithOAuth({
      provider,
      redirectTo: `${window.location.origin}/dashboard`,
    });
  }, []);

  const logout = useCallback(async () => {
    await insforge.auth.signOut();
    queryClient.clear();
    setUser(null);
    setAccessToken(null);
    setLocation("/");
    toast({ title: "Logged out", description: "See you soon!" });
  }, [setLocation, toast]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, verifyEmail, logout, signInWithOAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
