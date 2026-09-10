"use client";

import { useState } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatWindow } from "@/components/chat/chat-window";

export default function ChatPage() {
    const [sessionId, setSessionId] = useState<string | null>(null);

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-2xl border border-border bg-card">
            <ChatSidebar activeSessionId={sessionId} onSelectSession={setSessionId} />
            <div className="flex-1">
                <ChatWindow sessionId={sessionId} onNewSession={setSessionId} />
            </div>
        </div>
    );
}