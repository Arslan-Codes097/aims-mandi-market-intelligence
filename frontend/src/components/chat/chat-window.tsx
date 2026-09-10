"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { ChatInput } from "./chat-input";
import { useChat } from "@/hooks/use-chat";

export function ChatWindow({
    sessionId,
    onNewSession,
}: {
    sessionId: string | null;
    onNewSession: (id: string) => void;
}) {
    const { messages, isTyping, isLoadingHistory, sendMessage } = useChat(sessionId);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
                {!isLoadingHistory && messages.length === 0 && (
                    <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                        <div className="space-y-2">
                            <p className="font-display text-lg font-medium text-foreground">
                                Ask me about mandi prices
                            </p>
                            <p className="text-sm">
                                Try &quot;tomato rate in Lahore today&quot; or &quot;should I sell wheat in Multan&quot;
                            </p>
                        </div>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}
                </AnimatePresence>

                {isTyping && <TypingIndicator />}
                <div ref={bottomRef} />
            </div>

            <ChatInput onSend={(msg) => sendMessage(msg, onNewSession)} />
        </div>
    );
}