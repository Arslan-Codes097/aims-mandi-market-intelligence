"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommodities } from "@/hooks/use-commodities";

export function CommoditySelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    const { data: commodities, isLoading } = useCommodities();

    if (isLoading) return <Skeleton className="h-10 w-56" />;

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-56">
                <SelectValue placeholder="Select commodity" />
            </SelectTrigger>
            <SelectContent>
                {commodities?.map((c) => (
                    <SelectItem key={c} value={c}>
                        {c}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}