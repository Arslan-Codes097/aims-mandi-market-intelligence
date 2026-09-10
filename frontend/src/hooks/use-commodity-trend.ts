// src/hooks/use-commodity-trend.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { TrendResponse } from "@/types/market";

export function useCommodityTrend(commodity: string, city: string, days = 30) {
    return useQuery({
        queryKey: ["trend", commodity, city, days],
        queryFn: async () => {
            const { data } = await apiClient.get<TrendResponse>("/trend/", {
                params: { commodity, city, days },
            });
            return data;
        },
        enabled: !!commodity && !!city,
    });
}