"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CommoditiesResponse } from "@/types/market";

export function useCommodities() {
    return useQuery({
        queryKey: ["commodities"],
        queryFn: async () => {
            const { data } = await apiClient.get<CommoditiesResponse>("/commodities/");
            return data.commodities;
        },
        staleTime: 60 * 60 * 1000,
    });
}