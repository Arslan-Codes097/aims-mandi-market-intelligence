export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
    status?: "sending" | "sent" | "error";
}

export interface ChatReplyResponse {
    reply: string;
    session_id: string;
}

export interface ChatSession {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface ChatMessageRecord {
    id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
}