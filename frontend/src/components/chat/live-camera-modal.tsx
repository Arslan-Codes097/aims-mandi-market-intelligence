"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, X, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface LiveCameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (dataUri: string) => void;
}

export function LiveCameraModal({ isOpen, onClose, onCapture }: LiveCameraModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
    const [isStreaming, setIsStreaming] = useState(false);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setIsStreaming(false);
    }, []);

    const startCamera = useCallback(async (mode: "environment" | "user") => {
        stopStream();
        setError(null);

        try {
            if (!navigator?.mediaDevices?.getUserMedia) {
                throw new Error("Camera is not supported on this browser/device.");
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: mode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setIsStreaming(true);
            }
        } catch (err: any) {
            console.error("Camera access error:", err);
            // If environment failed on laptop, try fallback to user (webcam)
            if (mode === "environment") {
                try {
                    const fallbackStream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: false,
                    });
                    streamRef.current = fallbackStream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = fallbackStream;
                        await videoRef.current.play();
                        setIsStreaming(true);
                        setFacingMode("user");
                        return;
                    }
                } catch {
                    // ignore and show error below
                }
            }

            if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
                setError("Camera permission was denied. Please allow camera access in your browser settings.");
            } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
                setError("No camera was found on this device.");
            } else {
                setError(err?.message || "Failed to open camera.");
            }
        }
    }, [stopStream]);

    useEffect(() => {
        if (isOpen) {
            startCamera(facingMode);
        } else {
            stopStream();
            setError(null);
        }

        return () => {
            stopStream();
        };
    }, [isOpen, facingMode, startCamera, stopStream]);

    const handleFlipCamera = () => {
        const next = facingMode === "environment" ? "user" : "environment";
        setFacingMode(next);
    };

    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // If front camera, mirror image for natural selfie view, else regular
        if (facingMode === "user") {
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, width, height);

        const dataUri = canvas.toDataURL("image/jpeg", 0.88);
        onCapture(dataUri);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-xs"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative flex flex-col w-full max-w-lg overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-muted/40">
                        <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-sm text-foreground">
                                Snap Crop Photo
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            aria-label="Close camera"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Viewfinder area */}
                    <div className="relative aspect-4/3 w-full bg-black flex items-center justify-center overflow-hidden">
                        {error ? (
                            <div className="p-6 text-center text-rose-400 max-w-xs space-y-2">
                                <AlertCircle className="h-8 w-8 mx-auto text-rose-500" />
                                <p className="text-xs">{error}</p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startCamera(facingMode)}
                                    className="mt-2 text-xs"
                                >
                                    Retry Camera
                                </Button>
                            </div>
                        ) : (
                            <video
                                ref={videoRef}
                                playsInline
                                muted
                                autoPlay
                                className={`h-full w-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                            />
                        )}

                        {/* Hidden canvas for capturing frame */}
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Top controls: Flip Camera button */}
                        {!error && isStreaming && (
                            <button
                                type="button"
                                onClick={handleFlipCamera}
                                className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
                                title="Flip camera"
                                aria-label="Flip camera"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Footer Controls */}
                    <div className="flex items-center justify-between border-t border-border/50 p-4 bg-muted/20">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-xs text-muted-foreground"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            onClick={handleCapture}
                            disabled={!isStreaming || !!error}
                            className="flex items-center gap-2 rounded-full px-6 py-5 font-semibold text-sm shadow-md"
                        >
                            <span className="inline-block h-3 w-3 rounded-full bg-white animate-pulse" />
                            Capture Photo
                        </Button>

                        <div className="w-14" />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}