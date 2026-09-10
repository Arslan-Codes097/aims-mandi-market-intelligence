// src/hooks/use-arbitrage.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ArbitrageResponse } from "@/types/market";

export function useArbitrage(commodity: string) {
    return useQuery({
        queryKey: ["arbitrage", commodity],
        queryFn: async () => {
            const { data } = await apiClient.get<ArbitrageResponse>("/arbitrage/", {
                params: { commodity },
            });
            return data;
        },
        enabled: !!commodity,
    });
}