"use client";

import { AlertTriangle } from "lucide-react";
import type { AnomalyResponse } from "@/types/market";

export function AnomalyAlert({ anomaly }: { anomaly: AnomalyResponse }) {
    if (!anomaly.is_anomaly) return null;

    return (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div className="text-sm">
                <p className="font-medium text-destructive">Unusual price detected</p>
                <p className="mt-0.5 text-muted-foreground">
                    Current price Rs {anomaly.actual_price} is outside the expected range of Rs{" "}
                    {anomaly.expected_range.min_expected}–{anomaly.expected_range.max_expected}{" "}
                    (z-score {anomaly.z_score.toFixed(1)}).
                </p>
            </div>
        </div>
    );
}