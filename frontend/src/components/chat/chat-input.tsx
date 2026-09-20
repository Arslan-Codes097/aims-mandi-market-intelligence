"use client";

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent, ClipboardEvent } from "react";
import { Send, Plus, Camera, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveCameraModal } from "./live-camera-modal";

interface ChatInputProps {
    onSend: (msg: string, image?: string | null) => void;
    disabled?: boolean;
}

/**
 * Compresses and converts an image file to a base64 Data URI.
 * Scales down high-resolution camera photos to a max dimension of 1600px,
 * ensuring fast network transmission and compliance with API body limits.
 */
async function processImageFile(file: File, maxDimension = 1600, quality = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const rawDataUrl = e.target?.result as string;
            if (!rawDataUrl) {
                reject(new Error("Failed to read file."));
                return;
            }

            // Create image element to measure dimensions
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;

                // Only scale down if image exceeds max dimension
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                } else if (file.size < 500 * 1024) {
                    // Small file doesn't need re-encoding
                    resolve(rawDataUrl);
                    return;
                }

                try {
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        resolve(rawDataUrl);
                        return;
                    }

                    // Draw image to canvas with high quality smoothing
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressed = canvas.toDataURL("image/jpeg", quality);
                    resolve(compressed);
                } catch {
                    resolve(rawDataUrl);
                }
            };

            img.onerror = () => resolve(rawDataUrl);
            img.src = rawDataUrl;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [value, setValue] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageName, setImageName] = useState<string | null>(null);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleClearImage = () => {
        setSelectedImage(null);
        setImageName(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (cameraInputRef.current) cameraInputRef.current.value = "";
    };

    const handleFileSelected = async (file?: File) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            return;
        }

        setIsProcessingImage(true);
        try {
            const base64DataUri = await processImageFile(file);
            setSelectedImage(base64DataUri);
            setImageName(file.name || "crop-photo.jpg");
        } catch {
            handleClearImage();
        } finally {
            setIsProcessingImage(false);
            textareaRef.current?.focus();
        }
    };

    const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        handleFileSelected(file);
    };

    const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image/")) {
                const file = items[i].getAsFile();
                if (file) {
                    e.preventDefault();
                    handleFileSelected(file);
                    break;
                }
            }
        }
    };

    const handleSend = () => {
        if ((!value.trim() && !selectedImage) || disabled || isProcessingImage) return;

        onSend(value, selectedImage);
        setValue("");
        handleClearImage();

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const canSend = Boolean(value.trim() || selectedImage) && !disabled && !isProcessingImage;

    return (
        <div className="flex flex-col border-t border-border bg-card p-3">
            {/* Hidden native file inputs */}
            {/* Standard file picker */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileInputChange}
            />
            {/* Direct camera capture input for mobile devices */}
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onFileInputChange}
            />

            {/* Selected Image Preview Chip */}
            {selectedImage && (
                <div className="mb-2.5 flex items-center justify-between rounded-xl border border-border bg-muted/60 p-2 text-xs backdrop-blur-xs">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-background shadow-2xs">
                            <img
                                src={selectedImage}
                                alt="Selected crop preview"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">
                                {imageName || "Crop image attached"}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Multimodal crop grading active
                            </span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleClearImage}
                        className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Remove attached image"
                        aria-label="Remove attached image"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Processing Indicator */}
            {isProcessingImage && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span>Processing crop image for grading...</span>
                </div>
            )}

            {/* Input Row */}
            <div className="flex items-end gap-1.5 sm:gap-2">
                {/* Plus Menu Button & Popover */}
                <div ref={menuRef} className="relative shrink-0 pb-1">
                    <Button
                        type="button"
                        variant={isMenuOpen ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        disabled={disabled || isProcessingImage}
                        className={`h-9 w-9 rounded-xl transition-all ${
                            isMenuOpen
                                ? "bg-muted text-foreground ring-1 ring-border"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                        title="Add crop photo for grading"
                        aria-label="Add crop photo"
                    >
                        <Plus className={`h-5 w-5 transition-transform duration-200 ${isMenuOpen ? "rotate-45" : ""}`} />
                    </Button>

                    {/* Popover Menu */}
                    {isMenuOpen && (
                        <div className="absolute bottom-11 left-0 z-40 flex w-48 flex-col gap-0.5 rounded-xl border border-border bg-popover/95 p-1.5 shadow-xl backdrop-blur-md">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    setIsCameraModalOpen(true);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors text-left cursor-pointer"
                            >
                                <Camera className="h-4 w-4 text-primary" />
                                <span>Take Photo</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    fileInputRef.current?.click();
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors text-left cursor-pointer"
                            >
                                <ImageIcon className="h-4 w-4 text-emerald-500" />
                                <span>Upload from Device</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Live Camera Viewfinder Modal */}
                <LiveCameraModal
                    isOpen={isCameraModalOpen}
                    onClose={() => setIsCameraModalOpen(false)}
                    onCapture={(dataUri) => {
                        setSelectedImage(dataUri);
                        setImageName("Live Camera Photo.jpg");
                        textareaRef.current?.focus();
                    }}
                />

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    disabled={disabled}
                    placeholder={
                        selectedImage
                            ? "Add notes or question about this crop (e.g. check for blight, grade quality)..."
                            : "Ask mandi prices or attach a crop photo for grading... (e.g. tamatar rate Lahore aaj)"
                    }
                    maxLength={1000}
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring max-h-32 disabled:opacity-50"
                />

                {/* Send Button */}
                <Button
                    type="button"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-xl mb-0.5"
                    disabled={!canSend}
                    onClick={handleSend}
                    aria-label="Send message"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}