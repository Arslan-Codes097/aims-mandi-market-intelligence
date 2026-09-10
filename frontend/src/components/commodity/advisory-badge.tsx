"use client";

import { cn } from "@/lib/utils";
import type { AdvisoryResponse } from "@/types/market";

const STYLES: Record<AdvisoryResponse["recommendation"], string> = {
    buy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    sell: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    hold: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
};

export function AdvisoryBadge({ advisory }: { advisory: AdvisoryResponse }) {
    return (
        <div className={cn("rounded-2xl border p-4", STYLES[advisory.recommendation])}>
            <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold uppercase tracking-wide">
                    {advisory.recommendation}
                </span>
                <span className="rounded-full bg-background/50 px-2.5 py-0.5 text-xs font-medium capitalize">
                    {advisory.confidence} confidence
                </span>
            </div>
            <p className="mt-2 text-sm opacity-90">{advisory.reasoning}</p>
        </div>
    );
}