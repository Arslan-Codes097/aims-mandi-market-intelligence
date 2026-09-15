"use client";

import { motion } from "framer-motion";
import { ArrowRight, Fuel } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArbitrageRoute } from "@/types/market";

export function RouteCard({ route, rank }: { route: ArbitrageRoute; rank: number }) {
    const isTopRoute = rank === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: rank * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "relative overflow-hidden rounded-2xl border p-5",
                isTopRoute
                    ? "border-primary/40 bg-primary/5 glow-primary"
                    : "border-border bg-card"
            )}
        >
            {isTopRoute && (
                <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                    Best route
                </span>
            )}

            <div className="flex items-center gap-2 text-sm font-medium">
                <span className="text-foreground">{route.buy_city}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground">{route.sell_city}</span>
            </div>

            {route.total_net_profit !== null && (
                <div className="mt-3">
                    <p className="text-xs text-muted-foreground">Est. Trip Net Profit</p>
                    <p className="font-display text-2xl font-bold text-primary">PKR {route.total_net_profit.toLocaleString()}</p>
                </div>
            )}

            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                    <p className="text-xs text-muted-foreground">Buy at</p>
                    <p className="font-display font-semibold">Rs {route.buy_price}<span className="text-[10px] text-muted-foreground font-normal">/kg</span></p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Sell at</p>
                    <p className="font-display font-semibold">Rs {route.sell_price}<span className="text-[10px] text-muted-foreground font-normal">/kg</span></p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Gross margin</p>
                    <p className="font-display font-semibold text-primary">Rs {route.gross_margin}<span className="text-[10px] font-normal">/kg</span></p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5" title="Estimated total fuel cost for the trip">
                    <Fuel className="h-3.5 w-3.5" />
                    {route.fuel_cost !== null ? `Fuel: PKR ${route.fuel_cost.toLocaleString()} approx.` : "Fuel cost pending"}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                    Distance: {route.distance_km} KM
                </span>
            </div>
        </motion.div>
    );
}