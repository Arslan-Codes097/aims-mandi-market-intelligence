"use client";

import { useState } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatWindow } from "@/components/chat/chat-window";

export default function ChatPage() {
    const [sessionId, setSessionId] = useState<string | null>(null);

    return (
        <div className="flex flex-1 h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <ChatSidebar activeSessionId={sessionId} onSelectSession={setSessionId} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <ChatWindow sessionId={sessionId} onNewSession={setSessionId} />
            </div>
        </div>
    );
}