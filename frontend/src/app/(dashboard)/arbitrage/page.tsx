"use client";

import { useState, useMemo } from "react";
import { CommoditySelect } from "@/components/arbitrage/commodity-select";
import { RouteList } from "@/components/arbitrage/route-list";
import { useArbitrage } from "@/hooks/use-arbitrage";
import { deriveRoutes } from "@/lib/arbitrage";

export default function ArbitragePage() {
    const [commodity, setCommodity] = useState("Tomato");
    const { data, isLoading } = useArbitrage(commodity);

    const routes = useMemo(() => (data ? deriveRoutes(data) : []), [data]);

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="space-y-1">
                <h1 className="font-display text-2xl font-semibold">Arbitrage Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Find the most profitable buy-sell routes across mandis today
                </p>
            </div>

            <CommoditySelect value={commodity} onChange={setCommodity} />

            <RouteList routes={routes} isLoading={isLoading} />
        </div>
    );
}