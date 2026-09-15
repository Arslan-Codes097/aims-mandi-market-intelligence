"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ChatSession } from "@/types/chat";
import { useAuthStore } from "@/store/auth-store";

export function useChatSessions() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: ["chat-sessions"],
        queryFn: async () => {
            const { data } = await apiClient.get<ChatSession[]>("/chat/sessions/");
            return data;
        },
        enabled: isAuthenticated,
    });
}

export function useCreateChatSession() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data } = await apiClient.post<ChatSession>("/chat/sessions/", {});
            return data;
        },
        onSuccess: (session) => {
            qc.setQueryData<ChatSession[]>(["chat-sessions"], (prev) => [session, ...(prev ?? [])]);
        },
    });
}

export function useDeleteChatSession() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (sessionId: string) => {
            await apiClient.delete(`/chat/sessions/${sessionId}/`);
        },
        onSuccess: (_, sessionId) => {
            qc.setQueryData<ChatSession[]>(["chat-sessions"], (prev) =>
                (prev ?? []).filter((s) => s.id !== sessionId)
            );
        },
    });
}