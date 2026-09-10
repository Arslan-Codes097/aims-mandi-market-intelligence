"use client";

import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ChatMessage, ChatMessageRecord, ChatReplyResponse } from "@/types/chat";

function makeId() {
    return crypto.randomUUID();
}

function fromRecord(record: ChatMessageRecord): ChatMessage {
    return {
        id: record.id,
        role: record.role,
        content: record.content,
        timestamp: new Date(record.created_at).getTime(),
        status: "sent",
    };
}

export function useChat(sessionId: string | null) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!sessionId) {
            setMessages([]);
            return;
        }

        let cancelled = false;
        setIsLoadingHistory(true);

        apiClient
            .get<ChatMessageRecord[]>(`/chat/sessions/${sessionId}/messages/`)
            .then(({ data }) => {
                if (!cancelled) setMessages(data.map(fromRecord));
            })
            .finally(() => {
                if (!cancelled) setIsLoadingHistory(false);
            });

        return () => {
            cancelled = true;
        };
    }, [sessionId]);

    const sendMessage = useCallback(
        async (content: string, onNewSession?: (id: string) => void) => {
            const trimmed = content.trim();
            if (!trimmed || trimmed.length > 1000) return;

            setMessages((prev) => [
                ...prev,
                { id: makeId(), role: "user", content: trimmed, timestamp: Date.now(), status: "sent" },
            ]);
            setIsTyping(true);

            try {
                const { data } = await apiClient.post<ChatReplyResponse>("/chat/", {
                    message: trimmed,
                    session_id: sessionId ?? undefined,
                });

                setMessages((prev) => [
                    ...prev,
                    {
                        id: makeId(),
                        role: "assistant",
                        content: data.reply,
                        timestamp: Date.now(),
                        status: "sent",
                    },
                ]);

                if (!sessionId) onNewSession?.(data.session_id);
                queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
            } catch {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: makeId(),
                        role: "assistant",
                        content: "Sorry, something went wrong. Please try again.",
                        timestamp: Date.now(),
                        status: "error",
                    },
                ]);
            } finally {
                setIsTyping(false);
            }
        },
        [sessionId, queryClient]
    );

    return { messages, isTyping, isLoadingHistory, sendMessage };
}