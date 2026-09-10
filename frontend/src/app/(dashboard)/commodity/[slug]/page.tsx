"use client";

import { useState } from "react";
import { PriceChart } from "@/components/commodity/price-chart";
import { AdvisoryBadge } from "@/components/commodity/advisory-badge";
import { AnomalyAlert } from "@/components/commodity/anomaly-alert";
import { CommoditySelect } from "@/components/arbitrage/commodity-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommodityTrend } from "@/hooks/use-commodity-trend";
import { useAdvisory } from "@/hooks/use-advisory";
import { useAnomaly } from "@/hooks/use-anomaly";
import { useCities } from "@/hooks/use-cities";

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

export default function CommodityDeepDivePage() {
    const [commodity, setCommodity] = useState("Tomato");
    const [city, setCity] = useState("Lahore");

    const { data: cities, isLoading: citiesLoading } = useCities();
    const trend = useCommodityTrend(commodity, city, 30);
    const advisory = useAdvisory(commodity, city);
    const anomaly = useAnomaly(commodity, city, todayISO());

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div className="space-y-1">
                <h1 className="font-display text-2xl font-semibold">Commodity Deep-Dive</h1>
                <p className="text-sm text-muted-foreground">30-day price trend and AI advisory</p>
            </div>

            <div className="flex flex-wrap gap-3">
                <CommoditySelect value={commodity} onChange={setCommodity} />

                {citiesLoading ? (
                    <Skeleton className="h-10 w-48" />
                ) : (
                    <Select value={city} onValueChange={setCity}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                            {cities?.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {c}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {trend.isLoading ? (
                <Skeleton className="h-72 w-full rounded-2xl" />
            ) : trend.data ? (
                <PriceChart data={trend.data.data_points} />
            ) : null}

            {trend.data && (
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">30-day change:</span>
                    <span
                        className={
                            trend.data.direction === "rising"
                                ? "font-semibold text-emerald-600"
                                : trend.data.direction === "falling"
                                    ? "font-semibold text-red-600"
                                    : "font-semibold text-amber-600"
                        }
                    >
                        {trend.data.pct_change > 0 ? "+" : ""}
                        {trend.data.pct_change}% ({trend.data.direction})
                    </span>
                </div>
            )}

            {advisory.isLoading ? (
                <Skeleton className="h-24 w-full rounded-2xl" />
            ) : advisory.data ? (
                <AdvisoryBadge advisory={advisory.data} />
            ) : null}

            {anomaly.data && <AnomalyAlert anomaly={anomaly.data} />}
        </div>
    );
}