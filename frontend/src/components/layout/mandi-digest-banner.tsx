"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlistAlerts } from "@/hooks/use-watchlist-alerts";

export function MandiDigestBanner() {
    const { activeAlerts, dismissAlert } = useWatchlistAlerts();

    if (activeAlerts.length === 0) return null;

    // Pick top active alert
    const topAlert = activeAlerts[0];
    const isSpike = topAlert.direction === "spike";
    const Icon = isSpike ? TrendingUp : TrendingDown;

    return (
        <div
            className={cn(
                "mb-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-xs shadow-xs transition-all",
                isSpike
                    ? "border-emerald-500/40 bg-emerald-500/10 text-foreground"
                    : "border-rose-500/40 bg-rose-500/10 text-foreground"
            )}
        >
            <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span
                    className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs",
                        isSpike ? "bg-emerald-600" : "bg-rose-600"
                    )}
                >
                    <Icon className="h-3 w-3" />
                    {topAlert.direction.toUpperCase()} ({topAlert.change_pct > 0 ? `+${topAlert.change_pct}%` : `${topAlert.change_pct}%`})
                </span>

                <span className="font-semibold">{topAlert.title}:</span>

                <span className="text-muted-foreground truncate hidden sm:inline">
                    Current rate PKR {topAlert.current_price}/kg in {topAlert.city}.
                </span>

                <Link
                    href={`/commodity/${topAlert.slug}`}
                    className="inline-flex items-center gap-1 font-bold underline decoration-current underline-offset-2 hover:opacity-80 ml-1"
                >
                    View Chart <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            <button
                type="button"
                onClick={() => dismissAlert(topAlert.id)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-background/40 hover:text-foreground transition-colors shrink-0"
                title="Dismiss banner"
                aria-label="Dismiss banner"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}