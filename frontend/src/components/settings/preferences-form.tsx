"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CitySelector } from "./city-selector";
import { WatchlistInput } from "./watchlist-input";
import { usePreferences, useUpdatePreferences } from "@/hooks/use-preferences";

export function PreferencesForm() {
    const { data, isLoading } = usePreferences();
    const updatePreferences = useUpdatePreferences();

    const [homeCity, setHomeCity] = useState("Lahore");
    const [commodities, setCommodities] = useState<string[]>([]);
    const [watchlist, setWatchlist] = useState<string[]>([]);

    useEffect(() => {
        if (!data) return;
        setHomeCity(data.preferred_cities[0] ?? "Lahore");
        setCommodities(data.preferred_commodities);
        setWatchlist(data.watchlist);
    }, [data]);

    const handleSave = () => {
        const otherCities = (data?.preferred_cities ?? []).filter((c) => c !== homeCity);
        updatePreferences.mutate({
            preferred_cities: [homeCity, ...otherCities],
            preferred_commodities: commodities,
            watchlist,
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-56" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium">Home city</label>
                <p className="text-xs text-muted-foreground">
                    Used to calculate travel distance and fuel cost in the Arbitrage Dashboard
                </p>
                <CitySelector value={homeCity} onChange={setHomeCity} />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Preferred commodities</label>
                <WatchlistInput
                    values={commodities}
                    onChange={setCommodities}
                    placeholder="e.g. Tomato, Wheat"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Watchlist</label>
                <p className="text-xs text-muted-foreground">Commodities you want price alerts for</p>
                <WatchlistInput values={watchlist} onChange={setWatchlist} placeholder="e.g. Onion" />
            </div>

            <Button onClick={handleSave} disabled={updatePreferences.isPending}>
                {updatePreferences.isPending ? "Saving..." : "Save preferences"}
            </Button>
        </div>
    );
}