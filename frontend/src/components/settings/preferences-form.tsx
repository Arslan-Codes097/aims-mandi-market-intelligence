"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePreferences, useUpdatePreferences } from "@/hooks/use-preferences";
import { Combobox } from "@/components/ui/combobox";
import { useCities } from "@/hooks/use-cities";
import { useCommodities } from "@/hooks/use-commodities";

const OCCUPATION_OPTIONS = [
    { value: "Farmer", label: "Farmer" },
    { value: "Transporter", label: "Transporter" },
    { value: "Merchant/Trader", label: "Merchant/Trader" },
    { value: "Consumer", label: "Consumer" },
    { value: "Other", label: "Other" },
];

export function PreferencesForm() {
    const { data, isLoading } = usePreferences();
    const updatePreferences = useUpdatePreferences();

    const [homeCity, setHomeCity] = useState<string | null>(null);
    const [occupation, setOccupation] = useState<string | null>(null);
    const [commodities, setCommodities] = useState<string[]>([]);
    const [watchlist, setWatchlist] = useState<string[]>([]);

    const { data: citiesList = [] } = useCities();
    const { data: commoditiesList = [] } = useCommodities();
    
    const cityOptions = useMemo(() => citiesList.map(c => ({ value: c, label: c })), [citiesList]);
    const commodityOptions = useMemo(() => commoditiesList.map(c => ({ value: c, label: c })), [commoditiesList]);

    useEffect(() => {
        if (!data) return;
        setHomeCity(data.home_city);
        setOccupation(data.occupation);
        setCommodities(data.preferred_commodities || []);
        setWatchlist(data.watchlist || []);
    }, [data]);

    const handleSave = () => {
        updatePreferences.mutate({
            home_city: homeCity,
            occupation: occupation,
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
                <Combobox
                    options={cityOptions}
                    placeholder="Select city..."
                    value={cityOptions.find(c => c.value === homeCity) || null}
                    onChange={(val: any) => setHomeCity(val?.value || null)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Occupation</label>
                <Combobox
                    options={OCCUPATION_OPTIONS}
                    placeholder="Select occupation..."
                    value={OCCUPATION_OPTIONS.find(c => c.value === occupation) || null}
                    onChange={(val: any) => setOccupation(val?.value || null)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Preferred commodities</label>
                <Combobox
                    isMulti
                    options={commodityOptions}
                    placeholder="e.g. Tomato, Wheat"
                    value={commodityOptions.filter(c => commodities.includes(c.value))}
                    onChange={(vals: any) => setCommodities(vals ? vals.map((v: any) => v.value) : [])}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Watchlist</label>
                <p className="text-xs text-muted-foreground">Commodities you want price alerts for</p>
                <Combobox
                    isMulti
                    options={commodityOptions}
                    placeholder="e.g. Onion"
                    value={commodityOptions.filter(c => watchlist.includes(c.value))}
                    onChange={(vals: any) => setWatchlist(vals ? vals.map((v: any) => v.value) : [])}
                />
            </div>

            <Button onClick={handleSave} disabled={updatePreferences.isPending}>
                {updatePreferences.isPending ? "Saving..." : "Save preferences"}
            </Button>
        </div>
    );
}