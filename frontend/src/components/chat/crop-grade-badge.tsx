"use client";

import {
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    ShieldAlert,
    ShieldCheck,
    Gauge,
    Tag,
    Clock,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CropGradingMetadata } from "@/types/chat";

interface CropGradeBadgeProps {
    grading: CropGradingMetadata;
    className?: string;
}

export function CropGradeBadge({ grading, className }: CropGradeBadgeProps) {
    const raw = (grading.grade || "").toUpperCase().trim();
    const isGradeC =
        raw === "C" ||
        raw.startsWith("C ") ||
        raw.includes("GRADE C") ||
        raw.includes("SUBSTANDARD") ||
        raw.includes("POOR") ||
        raw.includes("REJECT");

    const isGradeB =
        !isGradeC &&
        (raw === "B" ||
            raw.startsWith("B ") ||
            raw.includes("GRADE B") ||
            raw.includes("STANDARD") ||
            raw.includes("FAIR"));

    const isGradeA = !isGradeC && !isGradeB;

    const rawDisease = grading.disease || (grading as any).disease_name;
    const isDiseaseDetected = Boolean(
        grading.diseaseDetected ||
        (grading as any).has_disease_or_defect ||
        (rawDisease &&
            !["none", "healthy", "no", "nil", "n/a", "none detected", "none detected (healthy)"].includes(
                rawDisease.toLowerCase().trim()
            ))
    );

    // Styling configuration based on grade
    const theme = isGradeA
        ? {
              cardBg: "bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/40 dark:border-emerald-700/50",
              badgeBg: "bg-emerald-600 text-white shadow-emerald-600/25",
              glow: "shadow-xs ring-1 ring-emerald-500/20",
              label: "Grade A",
              subLabel: "Premium / Export Quality",
              textColor: "text-emerald-800 dark:text-emerald-200",
              subTextColor: "text-emerald-700/80 dark:text-emerald-300/80",
              icon: Sparkles,
          }
        : isGradeB
        ? {
              cardBg: "bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/40 dark:border-amber-700/50",
              badgeBg: "bg-amber-500 text-white shadow-amber-500/25",
              glow: "shadow-xs ring-1 ring-amber-500/20",
              label: "Grade B",
              subLabel: "Standard / Commercial Quality",
              textColor: "text-amber-800 dark:text-amber-200",
              subTextColor: "text-amber-700/80 dark:text-amber-300/80",
              icon: ShieldAlert,
          }
        : {
              cardBg: "bg-rose-500/10 border-rose-500/30 dark:bg-rose-950/40 dark:border-rose-700/50",
              badgeBg: "bg-rose-600 text-white shadow-rose-600/25",
              glow: "shadow-xs ring-1 ring-rose-500/20",
              label: "Grade C",
              subLabel: "Substandard / Sorting Required",
              textColor: "text-rose-800 dark:text-rose-200",
              subTextColor: "text-rose-700/80 dark:text-rose-300/80",
              icon: AlertTriangle,
          };

    const GradeIcon = theme.icon;

    return (
        <div
            className={cn(
                "overflow-hidden rounded-xl border p-3.5 transition-all text-xs",
                theme.cardBg,
                theme.glow,
                className
            )}
        >
            {/* Top row: Grade Badge + Crop Name + Confidence */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-bold tracking-wide shadow-xs",
                            theme.badgeBg
                        )}
                    >
                        <GradeIcon className="h-3.5 w-3.5" />
                        {theme.label}
                    </span>
                    <span className={cn("font-medium", theme.subTextColor)}>
                        {theme.subLabel}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                    {grading.crop && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-background/70 px-2 py-0.5 font-medium text-foreground">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            {grading.crop}
                        </span>
                    )}

                    {grading.confidence && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-background/70 px-2 py-0.5 font-medium text-muted-foreground">
                            <Gauge className="h-3 w-3" />
                            {grading.confidence}
                        </span>
                    )}
                </div>
            </div>

            {/* Disease Detection Alert Section */}
            <div className="mt-2.5">
                {isDiseaseDetected ? (
                    <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-rose-800 dark:text-rose-200">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                        <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5 font-semibold">
                                <span>Disease Warning:</span>
                                <span className="underline decoration-rose-400 font-bold">
                                    {rawDisease || "Defect / Decay Detected"}
                                </span>
                                {grading.diseaseSeverity && (
                                    <span className="rounded bg-rose-600/20 px-1.5 py-0.2 text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300">
                                        {grading.diseaseSeverity}
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-rose-700/90 dark:text-rose-300/90 leading-tight">
                                Immediate sorting or treatment recommended before mandi dispatch.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-2 text-emerald-800 dark:text-emerald-200">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-medium text-[11px]">
                            Disease Free: No visible fungal, bacterial, or rot symptoms detected.
                        </span>
                    </div>
                )}
            </div>

            {/* Optional extra metadata row: Shelf life, defects */}
            {(grading.shelfLifeDays || (grading.defects && grading.defects.length > 0)) && (
                <div className="mt-2 flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                    {grading.shelfLifeDays && (
                        <span className="inline-flex items-center gap-1 rounded bg-background/50 px-2 py-0.5">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            Est. Shelf Life: {grading.shelfLifeDays} days
                        </span>
                    )}

                    {grading.defects && grading.defects.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded bg-background/50 px-2 py-0.5">
                            <AlertCircle className="h-3 w-3 text-muted-foreground" />
                            Defects: {grading.defects.join(", ")}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
