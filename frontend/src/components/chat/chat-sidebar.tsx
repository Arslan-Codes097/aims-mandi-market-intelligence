"use client";

import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatSessions, useDeleteChatSession } from "@/hooks/use-chat-sessions";

export function ChatSidebar({
    activeSessionId,
    onSelectSession,
}: {
    activeSessionId: string | null;
    onSelectSession: (id: string | null) => void;
}) {
    const { data: sessions, isLoading } = useChatSessions();
    const { mutate: deleteSession } = useDeleteChatSession();

    return (
        <div className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
            <div className="p-3">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => onSelectSession(null)}
                >
                    <Plus className="h-4 w-4" />
                    New chat
                </Button>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-2 pb-3">
                {isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}

                {sessions?.map((session) => (
                    <div
                        key={session.id}
                        className={cn(
                            "group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer",
                            activeSessionId === session.id
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        onClick={() => onSelectSession(session.id)}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{session.title}</span>
                        </div>
                        <button
                            className="hidden shrink-0 text-muted-foreground hover:text-destructive group-hover:block"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(session.id);
                                if (activeSessionId === session.id) {
                                    onSelectSession(null);
                                }
                            }}
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