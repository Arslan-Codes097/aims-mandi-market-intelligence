"use client";

import { useState, useMemo, useEffect } from "react";
import { CommoditySelect } from "@/components/arbitrage/commodity-select";
import { RouteList } from "@/components/arbitrage/route-list";
import { useArbitrage } from "@/hooks/use-arbitrage";
import { deriveRoutes } from "@/lib/arbitrage";
import { usePreferences } from "@/hooks/use-preferences";
import { Combobox } from "@/components/ui/combobox";
import { useCities } from "@/hooks/use-cities";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LocateFixed, Loader2 } from "lucide-react";
import { detectNearestCity } from "@/lib/geo";
import { toast } from "sonner";

export default function ArbitragePage() {
    const [commodity, setCommodity] = useState("Tomato");
    const [currentLocation, setCurrentLocation] = useState<string | null>(null);
    const [payloadKg, setPayloadKg] = useState<number>(1000);
    const [detecting, setDetecting] = useState(false);
    
    const { data: prefData } = usePreferences();
    const { data: arbitrageData, isLoading } = useArbitrage(commodity);
    const { data: citiesList = [] } = useCities();
    
    const cityOptions = useMemo(() => citiesList.map(c => ({ value: c, label: c })), [citiesList]);

    useEffect(() => {
        if (prefData?.home_city && !currentLocation) {
            setCurrentLocation(prefData.home_city);
        }
    }, [prefData, currentLocation]);

    const handleDetect = async () => {
        setDetecting(true);
        try {
            const city = await detectNearestCity();
            setCurrentLocation(city);
            toast.success(`Location set to ${city}`);
        } catch {
            toast.error("Couldn't access your location.");
        } finally {
            setDetecting(false);
        }
    };

    const routes = useMemo(() => (arbitrageData ? deriveRoutes(arbitrageData, currentLocation, payloadKg) : []), [arbitrageData, currentLocation, payloadKg]);

    const payloadOptions = [100, 200, 300, 400, 500, 1000, 1500, 2000, 3000, 5000, 10000];

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="space-y-1">
                <h1 className="font-display text-2xl font-semibold">Arbitrage Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Find the most profitable buy-sell routes based on your current location
                </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end flex-wrap">
                <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Commodity</label>
                    <CommoditySelect value={commodity} onChange={setCommodity} />
                </div>
                
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs text-muted-foreground">Current Location</label>
                    <div className="flex gap-2">
                        <div className="flex-1 max-w-[280px]">
                            <Combobox
                                options={cityOptions}
                                placeholder="Where are you right now?"
                                value={cityOptions.find(c => c.value === currentLocation) || null}
                                onChange={(val: any) => setCurrentLocation(val?.value || null)}
                            />
                        </div>
                        <Button type="button" variant="outline" size="icon" onClick={handleDetect} disabled={detecting}>
                            {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Vehicle Payload</label>
                    <Select value={payloadKg.toString()} onValueChange={(val) => setPayloadKg(Number(val))}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select payload" />
                        </SelectTrigger>
                        <SelectContent>
                            {payloadOptions.map((weight) => (
                                <SelectItem key={weight} value={weight.toString()}>
                                    {weight.toLocaleString()} KG
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <RouteList routes={routes} isLoading={isLoading} />
        </div>
    );
}