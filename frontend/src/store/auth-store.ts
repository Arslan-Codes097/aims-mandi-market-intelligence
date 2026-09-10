import { create } from "zustand";
import type { User } from "@/types/auth";
import { tokenStorage } from "@/lib/auth";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
    hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isHydrated: false,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    logout: () => {
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false });
    },
    hydrate: () => {
        // Presence of an access token = optimistically authenticated;
        // /api/me/preferences/ call (Module 3) will confirm + populate `user`.
        set({ isAuthenticated: !!tokenStorage.access, isHydrated: true });
    },
}));