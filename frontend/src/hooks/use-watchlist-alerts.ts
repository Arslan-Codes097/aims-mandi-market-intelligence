"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import type { WatchlistAlert, WatchlistAlertsResponse } from "@/types/alerts";

const STORAGE_KEY = "amis_dismissed_alert_ids";

export function useWatchlistAlerts() {
    const { isAuthenticated } = useAuthStore();
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);
    const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");

    // Load dismissed IDs and push permission state from localStorage & browser
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setDismissedIds(JSON.parse(raw));
        } catch {
            // ignore JSON parse errors
        }

        if (typeof window !== "undefined" && "Notification" in window) {
            setPushPermission(Notification.permission);
        }
    }, []);

    const { data, isLoading, error, refetch } = useQuery<WatchlistAlertsResponse>({
        queryKey: ["watchlist-alerts"],
        queryFn: async () => {
            const res = await apiClient.get<WatchlistAlertsResponse>("/me/alerts/");
            return res.data;
        },
        enabled: isAuthenticated,
        staleTime: 60 * 1000,
        refetchInterval: 60 * 1000,
    });

    const allAlerts = data?.alerts || [];
    const activeAlerts = allAlerts.filter((a) => !dismissedIds.includes(a.id));

    const dismissAlert = useCallback((id: string) => {
        setDismissedIds((prev) => {
            const next = Array.from(new Set([...prev, id]));
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {
                // ignore
            }
            return next;
        });
    }, []);

    const markAllRead = useCallback(() => {
        const allIds = allAlerts.map((a) => a.id);
        setDismissedIds(allIds);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
        } catch {
            // ignore
        }
    }, [allAlerts]);

    const requestPushPermission = useCallback(async () => {
        if (typeof window === "undefined" || !("Notification" in window)) {
            alert("This browser does not support desktop push notifications.");
            return;
        }

        try {
            const perm = await Notification.requestPermission();
            setPushPermission(perm);

            if (perm === "granted") {
                new Notification("🔔 AMIS Watchlist Alerts Active", {
                    body: "You will now receive instant desktop & mobile alerts whenever your watched mandi items experience price spikes!",
                    icon: "/favicon.ico",
                });
            }
        } catch (err) {
            console.error("Failed to request notification permission:", err);
        }
    }, []);

    const sendTestPush = useCallback((sampleAlert?: WatchlistAlert) => {
        if (typeof window === "undefined" || !("Notification" in window)) return;

        if (Notification.permission === "granted") {
            const title = sampleAlert
                ? `🚨 ${sampleAlert.title}`
                : "🚨 Tomato surged +13.3% in Lahore!";
            const body = sampleAlert
                ? sampleAlert.message
                : "Current mandi rate jumped to PKR 170/kg. Prime selling opportunity!";

            new Notification(title, {
                body,
                icon: "/favicon.ico",
                tag: "amis-mandi-alert",
            });
        }
    }, []);

    return {
        alerts: allAlerts,
        activeAlerts,
        unreadCount: activeAlerts.length,
        homeCity: data?.home_city || "Lahore",
        watchlist: data?.watchlist || [],
        isLoading,
        error,
        dismissAlert,
        markAllRead,
        pushPermission,
        requestPushPermission,
        sendTestPush,
        refetch,
    };
}