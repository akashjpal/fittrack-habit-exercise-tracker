import { useState, useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const TASKS_API_BASE = 'https://tasks.googleapis.com/tasks/v1';

export interface GoogleTask {
    id: string;
    title: string;
    parent?: string;
    status: 'needsAction' | 'completed';
    due?: string;
    notes?: string;
}

export function useGoogleTasks() {
    const [accessToken, setAccessToken] = useState<string | null>(
        localStorage.getItem('google_access_token')
    );
    const { toast } = useToast();

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => {
            setAccessToken(codeResponse.access_token);
            localStorage.setItem('google_access_token', codeResponse.access_token);
            toast({ title: "Connected to Google Tasks" });
        },
        onError: (error) => {
            console.error('Login Failed:', error);
            toast({ title: "Connection Failed", variant: "destructive" });
        },
        scope: 'https://www.googleapis.com/auth/tasks',
    });

    const logout = useCallback(() => {
        setAccessToken(null);
        localStorage.removeItem('google_access_token');
    }, []);

    const fetchWithAuth = useCallback(async (endpoint: string, options: RequestInit = {}) => {
        if (!accessToken) throw new Error("Not authenticated");

        const res = await fetch(`${TASKS_API_BASE}${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (res.status === 401) {
            // Token expired
            logout();
            throw new Error("Session expired. Please reconnect.");
        }

        if (!res.ok) {
            throw new Error(`API Error: ${res.statusText}`);
        }

        return res.json();
    }, [accessToken, logout]);

    const getTaskLists = useCallback(async () => {
        return fetchWithAuth('/users/@me/lists');
    }, [fetchWithAuth]);

    // Create a new list
    const createTaskList = useCallback(async (title: string) => {
        const newList = await fetchWithAuth('/users/@me/lists', {
            method: 'POST',
            body: JSON.stringify({ title }),
        });
        return newList;
    }, [fetchWithAuth]);

    const getTasks = useCallback(async (listId: string) => {
        try {
            const res = await fetchWithAuth(`/lists/${listId}/tasks?showCompleted=true&showHidden=true`);
            return res.items || [];
        } catch (err) {
            console.error(err);
            return [];
        }
    }, [fetchWithAuth]);

    const addTask = useCallback(async (taskTitle: string, notes: string | undefined, listId: string, dueDate?: Date) => {
        let dueString = undefined;

        if (dueDate) {
            dueString = dueDate.toISOString();
        } else {
            // Default: 11:59 PM today
            // We construct it as UTC to ensure the date part remains "today" when the API parses it
            const now = new Date();
            dueString = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)).toISOString();
        }

        return fetchWithAuth(`/lists/${listId}/tasks`, {
            method: 'POST',
            body: JSON.stringify({
                title: taskTitle,
                notes,
                status: 'needsAction',
                due: dueString
            }),
        });
    }, [fetchWithAuth]);

    const updateTask = useCallback(async (listId: string, taskId: string, updates: Partial<GoogleTask>) => {
        return fetchWithAuth(`/lists/${listId}/tasks/${taskId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
    }, [fetchWithAuth]);

    const deleteTask = useCallback(async (listId: string, taskId: string) => {
        return fetchWithAuth(`/lists/${listId}/tasks/${taskId}`, {
            method: 'DELETE',
        });
    }, [fetchWithAuth]);

    const toggleTaskStatus = useCallback(async (listId: string, taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'completed' ? 'needsAction' : 'completed';
        return updateTask(listId, taskId, { status: newStatus as any });
    }, [updateTask]);

    const analyzeHabits = useCallback(async (listId: string) => {
        // 1. Fetch all tasks (active + completed)
        const allTasks = await getTasks(listId);

        // 2. Separate into active and completed for clarity (optional, but good for debugging)
        const completedTasks = allTasks.filter((t: any) => t.status === 'completed');
        const activeTasks = allTasks.filter((t: any) => t.status === 'needsAction');

        // 3. Send to AI
        const res = await apiRequest("POST", "/api/ai/analyze-habits", {
            activeTasks,
            completedTasks
        });

        return res.json();
    }, [getTasks]);

    return {
        isAuthenticated: !!accessToken,
        login,
        logout,
        getTaskLists,
        createTaskList,
        getTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        analyzeHabits,
    };
}
