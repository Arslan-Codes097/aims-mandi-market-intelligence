"use client";

import { usePathname } from "next/navigation";
import { MapPin, Activity, LogOut } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { useWatchlistAlerts } from "@/hooks/use-watchlist-alerts";
import { useLogout } from "@/hooks/use-auth";

function getPageTitle(pathname: string): string {
    if (pathname.startsWith("/chat")) return "AMIS AI Agent";
    if (pathname.startsWith("/arbitrage")) return "Arbitrage Intelligence";
    if (pathname.startsWith("/commodity")) return "Commodity Analysis";
    if (pathname.startsWith("/settings")) return "Account Settings";
    return "Market Intelligence";
}

export function DashboardHeader() {
    const pathname = usePathname();
    const title = getPageTitle(pathname);
    const { homeCity } = useWatchlistAlerts();
    const logout = useLogout();

    return (
        <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-background/80 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
            {/* Left: Title & Status Indicator */}
            <div className="flex items-center gap-3">
                <h1 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                    {title}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    <Activity className="h-2.5 w-2.5 animate-pulse text-emerald-500" />
                    Live Mandi Feed
                </span>
            </div>

            {/* Right: Home City Badge, Notification Bell & Mobile Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
                {homeCity && (
                    <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/50 px-2 sm:px-2.5 py-1 text-xs text-muted-foreground font-medium">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span>{homeCity}</span>
                    </div>
                )}

                {/* Watchlist Notification Bell */}
                <NotificationBell />

                {/* Mobile Quick Logout */}
                <button
                    onClick={() => logout.mutate()}
                    className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                    title="Log out"
                    aria-label="Log out"
                >
                    <LogOut className="h-4 w-4" />
                </button>
            </div>
        </header>
    );
}