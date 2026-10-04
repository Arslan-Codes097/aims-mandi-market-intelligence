"use client";

import { useState } from "react";
import { Plus, History } from "lucide-react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="relative flex flex-1 h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            {/* Desktop Sidebar (visible on md and above) */}
            <ChatSidebar
                activeSessionId={sessionId}
                onSelectSession={setSessionId}
                className="hidden md:flex w-64 shrink-0"
            />

            {/* Mobile Drawer (visible when open on mobile < md) */}
            {isMobileSidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />

                    {/* Slide-over panel */}
                    <div className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-card border-r border-border shadow-2xl h-full animate-in slide-in-from-left duration-200">
                        <ChatSidebar
                            activeSessionId={sessionId}
                            onSelectSession={setSessionId}
                            onCloseMobile={() => setIsMobileSidebarOpen(false)}
                            className="w-full h-full border-r-0"
                        />
                    </div>
                </div>
            )}

            {/* Main Chat Conversation Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Mobile Top Sub-Header Bar (hidden on md and above) */}
                <div className="flex md:hidden items-center justify-between border-b border-border bg-muted/30 px-3 py-2 shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:bg-muted h-8 px-2.5 rounded-lg border border-border/60 bg-background shadow-2xs"
                    >
                        <History className="h-3.5 w-3.5 text-primary" />
                        <span>Conversations</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSessionId(null);
                            setIsMobileSidebarOpen(false);
                        }}
                        className="flex items-center gap-1.5 text-xs font-medium h-8 px-2.5 rounded-lg bg-background hover:bg-primary/5 hover:text-primary"
                    >
                        <Plus className="h-3.5 w-3.5 text-primary" />
                        <span>New Chat</span>
                    </Button>
                </div>

                <ChatWindow sessionId={sessionId} onNewSession={setSessionId} />
            </div>
        </div>
    );
}