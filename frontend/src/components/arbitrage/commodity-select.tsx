"use client";

import { useMemo } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommodities } from "@/hooks/use-commodities";

export function CommoditySelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    const { data: commodities = [], isLoading } = useCommodities();
    
    const options = useMemo(() => commodities.map(c => ({ value: c, label: c })), [commodities]);

    if (isLoading) return <Skeleton className="h-10 w-56" />;

    return (
        <div className="w-56">
            <Combobox
                options={options}
                placeholder="Select commodity..."
                value={options.find(c => c.value === value) || null}
                onChange={(val: any) => onChange(val?.value || "")}
            />
        </div>
    );
}