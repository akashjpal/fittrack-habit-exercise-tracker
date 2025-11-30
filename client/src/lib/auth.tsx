import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "./queryClient";
import { User, InsertUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: Pick<InsertUser, "username" | "password">) => Promise<void>;
    register: (credentials: InsertUser) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await apiRequest("GET", "/api/auth/me");
                const data = await res.json();
                setUser(data);
            } catch (e) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();

        const handleUnauthorized = () => {
            setUser(null);
            setLocation("/");
            toast({
                title: "Session expired",
                description: "Please log in again.",
                variant: "destructive"
            });
        };

        window.addEventListener("unauthorized", handleUnauthorized);
        return () => window.removeEventListener("unauthorized", handleUnauthorized);
    }, []);

    const login = async (credentials: Pick<InsertUser, "username" | "password">) => {
        try {
            const res = await apiRequest("POST", "/api/auth/login", credentials);
            const data = await res.json();
            setUser(data.user);
            toast({ title: "Welcome back!", description: "Logged in successfully." });
            setLocation("/dashboard");
        } catch (error: any) {
            toast({
                title: "Login failed",
                description: error.message || "Invalid credentials",
                variant: "destructive"
            });
            throw error;
        }
    };

    const register = async (credentials: InsertUser) => {
        try {
            const res = await apiRequest("POST", "/api/auth/register", credentials);
            const data = await res.json();
            setUser(data.user);
            toast({ title: "Welcome!", description: "Account created successfully." });
            setLocation("/dashboard");
        } catch (error: any) {
            toast({
                title: "Registration failed",
                description: error.message || "Could not create account",
                variant: "destructive"
            });
            throw error;
        }
    };

    const logout = async () => {
        try {
            await apiRequest("POST", "/api/auth/logout");
            queryClient.clear(); // Clear all cached data
            setUser(null);
            setLocation("/");
            toast({ title: "Logged out", description: "See you soon!" });
        } catch (error: any) {
            toast({
                title: "Logout failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
