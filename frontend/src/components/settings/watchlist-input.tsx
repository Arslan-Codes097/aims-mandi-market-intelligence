"use client";

import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function WatchlistInput({
    values,
    onChange,
    placeholder,
}: {
    values: string[];
    onChange: (values: string[]) => void;
    placeholder: string;
}) {
    const [draft, setDraft] = useState("");

    const addItem = () => {
        const trimmed = draft.trim();
        if (!trimmed || values.includes(trimmed)) return;
        onChange([...values, trimmed]);
        setDraft("");
    };

    const removeItem = (item: string) => {
        onChange(values.filter((v) => v !== item));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addItem();
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    onClick={addItem}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card hover:bg-muted"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            {values.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {values.map((item) => (
                        <Badge key={item} variant="secondary" className="gap-1 pr-1">
                            {item}
                            <button
                                type="button"
                                onClick={() => removeItem(item)}
                                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}