"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    Bell,
    TrendingUp,
    TrendingDown,
    X,
    CheckCheck,
    Radio,
    Sparkles,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWatchlistAlerts } from "@/hooks/use-watchlist-alerts";

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const {
        activeAlerts,
        unreadCount,
        dismissAlert,
        markAllRead,
        pushPermission,
        requestPushPermission,
        watchlist,
    } = useWatchlistAlerts();

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const isPushGranted = pushPermission === "granted";

    return (
        <div ref={popoverRef} className="relative">
            {/* Bell Icon Trigger */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="View notifications"
                title="Mandi Price Alerts"
            >
                <Bell className="h-5 w-5" />

                {/* Badge Count & Animated Pulse */}
                {unreadCount > 0 && (
                    <>
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
                            {unreadCount}
                        </span>
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500/40 animate-ping pointer-events-none" />
                    </>
                )}
            </Button>

            {/* Notifications Popover Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card text-card-foreground shadow-2xl ring-1 ring-border/80 animate-in fade-in-0 zoom-in-95 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/80">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">
                                Watchlist Price Alerts
                            </span>
                            {unreadCount > 0 && (
                                <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllRead}
                                className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                title="Mark all as read"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Device Push Notification Status / Prompt */}
                    {!isPushGranted && pushPermission !== "denied" && (
                        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2 text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Radio className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                <span className="text-[11px]">Enable price alerts on your device</span>
                            </div>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={requestPushPermission}
                                className="h-6 px-2 text-[10px] rounded-md border-primary/40 text-primary hover:bg-primary hover:text-white"
                            >
                                Enable
                            </Button>
                        </div>
                    )}

                    {isPushGranted && (
                        <div className="flex items-center justify-between border-b border-border/60 bg-emerald-500/5 px-4 py-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                            <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                <span className="font-medium">Push alerts active</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">Device permission granted</span>
                        </div>
                    )}

                    {pushPermission === "denied" && (
                        <div className="flex items-center justify-between border-b border-border/60 bg-amber-500/10 px-4 py-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                            <span>Push alerts blocked in browser settings</span>
                        </div>
                    )}

                    {/* Alerts List */}
                    <div className="max-h-80 overflow-y-auto p-2.5 space-y-2 bg-card">
                        {activeAlerts.length === 0 ? (
                            <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                                <Sparkles className="h-6 w-6 mx-auto text-muted-foreground/60 mb-1" />
                                {watchlist.length === 0 ? (
                                    <>
                                        <p className="font-semibold text-foreground">Your Watchlist is Empty</p>
                                        <p className="text-[11px] max-w-[220px] mx-auto text-muted-foreground">
                                            Add commodities in Settings to get real-time price spike and drop alerts.
                                        </p>
                                        <Link
                                            href="/settings"
                                            onClick={() => setIsOpen(false)}
                                            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline mt-1"
                                        >
                                            Configure Watchlist &rarr;
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-semibold text-foreground">All caught up!</p>
                                        <p className="text-[11px] max-w-[220px] mx-auto text-muted-foreground">
                                            No major price spikes detected on your watchlist commodities today.
                                        </p>
                                    </>
                                )}
                            </div>
                        ) : (
                            activeAlerts.map((alert) => {
                                const isSpike = alert.direction === "spike";
                                const Icon = isSpike ? TrendingUp : TrendingDown;

                                return (
                                    <div
                                        key={alert.id}
                                        className={cn(
                                            "group relative flex flex-col gap-1.5 rounded-xl p-3 text-xs transition-colors border shadow-2xs",
                                            isSpike
                                                ? "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-foreground"
                                                : "border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10 text-foreground"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-1.5 font-bold text-foreground">
                                                <Icon
                                                    className={cn(
                                                        "h-4 w-4 shrink-0",
                                                        isSpike ? "text-emerald-500" : "text-rose-500"
                                                    )}
                                                />
                                                <span>{alert.title}</span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    dismissAlert(alert.id);
                                                }}
                                                className="rounded-md p-1 text-muted-foreground opacity-60 hover:opacity-100 hover:bg-muted transition-opacity"
                                                title="Dismiss alert"
                                                aria-label="Dismiss alert"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            {alert.message}
                                        </p>

                                        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                                            <span>
                                                Rate: <strong className="text-foreground">PKR {alert.current_price}/kg</strong>
                                            </span>

                                            <Link
                                                href={`/commodity/${alert.slug}`}
                                                onClick={() => setIsOpen(false)}
                                                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                                            >
                                                View Live Chart <ExternalLink className="h-2.5 w-2.5" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}