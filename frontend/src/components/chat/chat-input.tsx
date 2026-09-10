"use client";

import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
    const [value, setValue] = useState("");

    const handleSend = () => {
        if (!value.trim()) return;
        onSend(value);
        setValue("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex items-end gap-2 border-t border-border bg-card p-3">
            <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about mandi prices... (e.g. tamatar rate Sahiwal aaj)"
                maxLength={1000}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring max-h-32"
            />
            <Button
                size="icon"
                className="shrink-0 rounded-xl"
                disabled={!value.trim()}
                onClick={handleSend}
            >
                <Send className="h-4 w-4" />
            </Button>
        </div>
    );
}