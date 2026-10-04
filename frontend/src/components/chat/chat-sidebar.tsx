"use client";

import { Plus, MessageSquare, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatSessions, useDeleteChatSession } from "@/hooks/use-chat-sessions";

interface ChatSidebarProps {
    activeSessionId: string | null;
    onSelectSession: (id: string | null) => void;
    onCloseMobile?: () => void;
    className?: string;
}

export function ChatSidebar({
    activeSessionId,
    onSelectSession,
    onCloseMobile,
    className,
}: ChatSidebarProps) {
    const { data: sessions, isLoading } = useChatSessions();
    const { mutate: deleteSession } = useDeleteChatSession();

    const handleSelect = (id: string | null) => {
        onSelectSession(id);
        onCloseMobile?.();
    };

    return (
        <div className={cn("flex w-64 shrink-0 flex-col border-r border-border bg-card", className)}>
            <div className="flex items-center justify-between p-3 border-b border-border/40 gap-2">
                <Button
                    variant="outline"
                    className="flex-1 justify-start gap-2 text-xs sm:text-sm font-medium"
                    onClick={() => handleSelect(null)}
                >
                    <Plus className="h-4 w-4 text-primary" />
                    New chat
                </Button>
                {onCloseMobile && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg md:hidden text-muted-foreground hover:text-foreground shrink-0"
                        onClick={onCloseMobile}
                        aria-label="Close conversations"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-2 py-3">
                {isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}

                {sessions?.map((session) => (
                    <div
                        key={session.id}
                        className={cn(
                            "group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer",
                            activeSessionId === session.id
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        onClick={() => handleSelect(session.id)}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{session.title}</span>
                        </div>
                        <button
                            className="shrink-0 text-muted-foreground/60 hover:text-destructive md:hidden md:group-hover:block transition-colors p-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(session.id);
                                if (activeSessionId === session.id) {
                                    onSelectSession(null);
                                }
                            }}
                            title="Delete conversation"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                {sessions?.length === 0 && !isLoading && (
                    <p className="px-3 py-4 text-center text-xs text-muted-foreground">No conversations yet</p>
                )}
            </div>
        </div>
    );
}