"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CitiesResponse } from "@/types/market";

export function useCities() {
    return useQuery({
        queryKey: ["cities"],
        queryFn: async () => {
            const { data } = await apiClient.get<CitiesResponse>("/cities/");
            return data.cities;
        },
        staleTime: 60 * 60 * 1000,
    });
}