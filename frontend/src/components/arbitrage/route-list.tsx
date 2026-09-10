"use client";

import { AnimatePresence } from "framer-motion";
import { RouteCard } from "./route-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ArbitrageRoute } from "@/types/market";

export function RouteList({
    routes,
    isLoading,
}: {
    routes: ArbitrageRoute[];
    isLoading: boolean;
}) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-36 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    if (routes.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                No profitable routes found for this commodity today.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <AnimatePresence initial={false}>
                {routes.map((route, i) => (
                    <RouteCard key={`${route.buy_city}-${route.sell_city}`} route={route} rank={i} />
                ))}
            </AnimatePresence>
        </div>
    );
}