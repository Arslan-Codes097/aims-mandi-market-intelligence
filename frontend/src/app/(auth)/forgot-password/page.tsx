"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/hooks/use-auth";
import { ROUTES } from "@/lib/constants";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { register, handleSubmit } = useForm<FormValues>({ resolver: zodResolver(schema) });
    const forgotPassword = useForgotPassword();

    const onSubmit = (v: FormValues) => {
        forgotPassword.mutate(v, {
            onSuccess: () =>
                router.push(`${ROUTES.resetPassword}?email=${encodeURIComponent(v.email)}`),
        });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="font-display text-2xl font-semibold">Forgot password</h1>
                <p className="text-sm text-muted-foreground">We&apos;ll send a reset code to your email</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input placeholder="Email" type="email" {...register("email")} />
                <Button type="submit" className="w-full" disabled={forgotPassword.isPending}>
                    {forgotPassword.isPending ? "Sending..." : "Send reset code"}
                </Button>
            </form>
        </div>
    );
}