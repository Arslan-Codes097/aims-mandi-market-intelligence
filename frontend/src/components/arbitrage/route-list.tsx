"use client";

import { motion, AnimatePresence } from "framer-motion";
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
    return (
        <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid gap-4 md:grid-cols-2"
                >
                    {[0, 1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-36 w-full rounded-2xl" />
                    ))}
                </motion.div>
            ) : routes.length === 0 ? (
                <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground"
                >
                    No profitable routes found for this commodity today.
                </motion.div>
            ) : (
                <motion.div 
                    key="content"
                    className="grid gap-4 md:grid-cols-2"
                >
                    <AnimatePresence>
                        {routes.map((route, i) => (
                            <RouteCard key={`${route.buy_city}-${route.sell_city}`} route={route} rank={i} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}