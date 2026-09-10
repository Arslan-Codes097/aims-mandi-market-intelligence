// src/hooks/use-anomaly.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AnomalyResponse } from "@/types/market";

export function useAnomaly(commodity: string, city: string, date: string) {
    return useQuery({
        queryKey: ["anomaly", commodity, city, date],
        queryFn: async () => {
            const { data } = await apiClient.get<AnomalyResponse>("/anomaly/", {
                params: { commodity, city, date },
            });
            return data;
        },
        enabled: !!commodity && !!city && !!date,
    });
}