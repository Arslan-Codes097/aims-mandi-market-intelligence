"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { parseCropGrading } from "@/lib/crop-grading-parser";
import { CropGradeBadge } from "./crop-grade-badge";

export function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === "user";
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Parse grading metadata either from message.grading or from embedded content
    const { grading, cleanContent } = !isUser
        ? parseCropGrading(message.content, message.grading)
        : { grading: null, cleanContent: message.content };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={cn("flex", isUser ? "justify-end" : "justify-start")}
            >
                <div
                    className={cn(
                        "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        isUser
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm",
                        message.status === "error" && "border border-destructive/50"
                    )}
                >
                    {/* User's uploaded image preview thumbnail */}
                    {isUser && message.image && (
                        <div className="mb-2.5">
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => setIsLightboxOpen(true)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        setIsLightboxOpen(true);
                                    }
                                }}
                                className="group relative block overflow-hidden rounded-xl border border-white/20 shadow-xs cursor-pointer transition-transform hover:scale-[1.01]"
                                title="Click to view full image"
                            >
                                <img
                                    src={message.image}
                                    alt="Uploaded crop"
                                    className="max-h-60 w-auto max-w-full rounded-xl object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
                                        <ZoomIn className="h-3.5 w-3.5" /> View
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Assistant's Crop Grade Badge (if grading metadata or grade tags detected) */}
                    {!isUser && grading && (
                        <div className="mb-3">
                            <CropGradeBadge grading={grading} />
                        </div>
                    )}

                    {/* Conversational Reply Markdown */}
                    {cleanContent && (
                        <div className="prose prose-sm dark:prose-invert max-w-none break-words [&>p]:leading-relaxed [&>p:last-child]:mb-0">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {cleanContent}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Lightbox Modal for Full Resolution Image Viewing */}
            <AnimatePresence>
                {isLightboxOpen && message.image && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsLightboxOpen(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/20 bg-card shadow-2xl"
                        >
                            <button
                                type="button"
                                onClick={() => setIsLightboxOpen(false)}
                                className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
                                aria-label="Close enlarged preview"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <img
                                src={message.image}
                                alt="Enlarged crop view"
                                className="max-h-[85vh] w-auto max-w-full object-contain"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}