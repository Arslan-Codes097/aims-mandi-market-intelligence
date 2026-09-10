// src/hooks/use-preferences.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { UserPreferences } from "@/types/market";

export function usePreferences() {
    return useQuery({
        queryKey: ["preferences"],
        queryFn: async () => {
            const { data } = await apiClient.get<UserPreferences>("/me/preferences/");
            return data;
        },
    });
}

export function useUpdatePreferences() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Partial<Omit<UserPreferences, "updated_at">>) =>
            apiClient.patch<UserPreferences>("/me/preferences/", payload),
        onSuccess: (res) => qc.setQueryData(["preferences"], res.data),
    });
}