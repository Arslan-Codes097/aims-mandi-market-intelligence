// src/hooks/use-advisory.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AdvisoryResponse } from "@/types/market";

export function useAdvisory(commodity: string, city: string) {
    return useQuery({
        queryKey: ["advisory", commodity, city],
        queryFn: async () => {
            const { data } = await apiClient.get<AdvisoryResponse>("/advisory/", {
                params: { commodity, city },
            });
            return data;
        },
        enabled: !!commodity && !!city,
    });
}