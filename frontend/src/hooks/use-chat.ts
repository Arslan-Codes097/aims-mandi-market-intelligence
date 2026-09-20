"use client";

import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ChatMessage, ChatMessageRecord, ChatReplyResponse } from "@/types/chat";
import { parseCropGrading } from "@/lib/crop-grading-parser";

function makeId() {
    return crypto.randomUUID();
}

function fromRecord(record: ChatMessageRecord): ChatMessage {
    const { grading } = parseCropGrading(record.content, record.grading);
    return {
        id: record.id,
        role: record.role,
        content: record.content,
        timestamp: new Date(record.created_at).getTime(),
        status: "sent",
        image: record.image,
        grading: grading || undefined,
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
        async (
            content: string,
            image?: string | null,
            onNewSession?: (id: string) => void
        ) => {
            const trimmed = content.trim();
            if (!trimmed && !image) return;
            if (trimmed.length > 2000) return;

            const effectiveContent =
                trimmed || "Please inspect this crop image, grade its quality, and check for any disease symptoms.";

            const userMsg: ChatMessage = {
                id: makeId(),
                role: "user",
                content: effectiveContent,
                timestamp: Date.now(),
                status: "sent",
                image: image || undefined,
            };

            setMessages((prev) => [...prev, userMsg]);
            setIsTyping(true);

            try {
                const payload: {
                    message: string;
                    session_id?: string;
                    image?: string;
                } = {
                    message: effectiveContent,
                    session_id: sessionId ?? undefined,
                };
                if (image) {
                    payload.image = image;
                }

                const { data } = await apiClient.post<ChatReplyResponse>("/chat/", payload);

                const { grading } = parseCropGrading(data.reply, data.grading);

                setMessages((prev) => [
                    ...prev,
                    {
                        id: makeId(),
                        role: "assistant",
                        content: data.reply,
                        timestamp: Date.now(),
                        status: "sent",
                        grading: grading || undefined,
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