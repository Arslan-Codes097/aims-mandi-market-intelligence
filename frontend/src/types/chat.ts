export type CropQualityGrade =
    | "A"
    | "B"
    | "C"
    | "Grade A"
    | "Grade B"
    | "Grade C"
    | string;

export interface CropGradingMetadata {
    grade: CropQualityGrade;
    crop?: string;
    variety?: string;
    confidence?: number | string;
    qualityScore?: number | string;
    disease?: string | null;
    diseaseDetected?: boolean;
    diseaseSeverity?: "Low" | "Moderate" | "High" | "None" | string;
    defects?: string[];
    shelfLifeDays?: number | string;
    recommendations?: string[];
    details?: string;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
    status?: "sending" | "sent" | "error";
    image?: string;
    grading?: CropGradingMetadata | null;
}

export interface ChatReplyResponse {
    reply: string;
    session_id: string;
    grading?: CropGradingMetadata | null;
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
    image?: string;
    grading?: CropGradingMetadata | null;
}