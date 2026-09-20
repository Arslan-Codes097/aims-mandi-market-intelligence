import { create } from "zustand";

const STORAGE_KEY = "amis_dismissed_alert_ids";

function getStoredDismissedIds(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

interface AlertsState {
    dismissedIds: string[];
    isHydrated: boolean;
    dismissAlert: (id: string) => void;
    markAllRead: (allIds: string[]) => void;
    hydrate: () => void;
}

export const useAlertsStore = create<AlertsState>((set) => ({
    dismissedIds: [],
    isHydrated: false,
    dismissAlert: (id: string) => {
        set((state) => {
            const next = Array.from(new Set([...state.dismissedIds, id]));
            if (typeof window !== "undefined") {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                } catch {
                    // ignore
                }
            }
            return { dismissedIds: next };
        });
    },
    markAllRead: (allIds: string[]) => {
        set((state) => {
            const next = Array.from(new Set([...state.dismissedIds, ...allIds]));
            if (typeof window !== "undefined") {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                } catch {
                    // ignore
                }
            }
            return { dismissedIds: next };
        });
    },
    hydrate: () => {
        const ids = getStoredDismissedIds();
        set({ dismissedIds: ids, isHydrated: true });
    },
}));
