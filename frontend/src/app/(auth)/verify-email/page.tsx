"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useVerifyEmail, useResendOtp } from "@/hooks/use-auth";

function VerifyEmailForm() {
    const params = useSearchParams();
    const email = params.get("email") ?? "";
    const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const verify = useVerifyEmail();
    const resend = useResendOtp();

    const handleChange = (i: number, val: string) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...digits];
        next[i] = val;
        setDigits(next);
        if (val && i < 5) inputsRef.current[i + 1]?.focus();
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !digits[i] && i > 0) {
            inputsRef.current[i - 1]?.focus();
        }
    };

    const code = digits.join("");

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="font-display text-2xl font-semibold">Verify your email</h1>
                <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to <span className="font-medium">{email}</span>
                </p>
            </div>

            <div className="flex justify-between gap-2">
                {digits.map((d, i) => (
                    <input
                        key={i}
                        ref={(el) => { inputsRef.current[i] = el; }}
                        value={d}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        maxLength={1}
                        inputMode="numeric"
                        className="h-14 w-12 rounded-lg border border-border bg-card text-center text-xl font-semibold outline-none focus:ring-2 focus:ring-ring"
                    />
                ))}
            </div>

            <Button
                className="w-full"
                disabled={code.length !== 6 || verify.isPending}
                onClick={() => verify.mutate({ email, code })}
            >
                {verify.isPending ? "Verifying..." : "Verify"}
            </Button>

            <button
                onClick={() => resend.mutate({ email })}
                disabled={resend.isPending}
                className="w-full text-center text-sm text-primary hover:underline disabled:opacity-50"
            >
                Resend code
            </button>
        </div>
    );
}

import { Suspense } from "react";

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading...</div>}>
            <VerifyEmailForm />
        </Suspense>
    );
}