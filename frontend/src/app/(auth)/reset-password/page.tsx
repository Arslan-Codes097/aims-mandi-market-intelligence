"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResetPassword } from "@/hooks/use-auth";

const schema = z.object({
    code: z.string().length(6, "Enter the 6-digit code"),
    new_password: z.string().min(8, "At least 8 characters"),
});
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
    const params = useSearchParams();
    const email = params.get("email") ?? "";
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });
    const resetPassword = useResetPassword();

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="font-display text-2xl font-semibold">Reset password</h1>
                <p className="text-sm text-muted-foreground">
                    Enter the code sent to <span className="font-medium">{email}</span>
                </p>
            </div>
            <form
                onSubmit={handleSubmit((v) => resetPassword.mutate({ email, ...v }))}
                className="space-y-4"
            >
                <div className="space-y-1.5">
                    <Input placeholder="6-digit code" {...register("code")} />
                    {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <Input placeholder="New password" type="password" {...register("new_password")} />
                    {errors.new_password && (
                        <p className="text-xs text-destructive">{errors.new_password.message}</p>
                    )}
                </div>
                <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
                    {resetPassword.isPending ? "Resetting..." : "Reset password"}
                </Button>
            </form>
        </div>
    );
}