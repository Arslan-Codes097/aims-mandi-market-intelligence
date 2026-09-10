"use client";

import { useState } from "react";
import { LocateFixed, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CITY_COORDS, detectNearestCity } from "@/lib/geo";

export function CitySelector({
    value,
    onChange,
}: {
    value: string;
    onChange: (city: string) => void;
}) {
    const [detecting, setDetecting] = useState(false);

    const handleDetect = async () => {
        setDetecting(true);
        try {
            const city = await detectNearestCity();
            onChange(city);
            toast.success(`Home city set to ${city}`);
        } catch {
            toast.error("Couldn't access your location. Please select manually.");
        } finally {
            setDetecting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-56">
                    <SelectValue placeholder="Select home city" />
                </SelectTrigger>
                <SelectContent>
                    {Object.keys(CITY_COORDS).map((city) => (
                        <SelectItem key={city} value={city}>
                            {city}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button type="button" variant="outline" size="icon" onClick={handleDetect} disabled={detecting}>
                {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            </Button>
        </div>
    );
}