"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-auth";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { ROUTES } from "@/lib/constants";

const schema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });
    const login = useLogin();

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
                <p className="text-sm text-muted-foreground">Log in to your AMIS account</p>
            </div>

            <form onSubmit={handleSubmit((v) => login.mutate(v))} className="space-y-4">
                <div className="space-y-1.5">
                    <Input placeholder="Email" type="email" {...register("email")} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <Input placeholder="Password" type="password" {...register("password")} />
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
                <div className="flex justify-end">
                    <Link href={ROUTES.forgotPassword} className="text-sm text-primary hover:underline">
                        Forgot password?
                    </Link>
                </div>
                <Button type="submit" className="w-full" disabled={login.isPending}>
                    {login.isPending ? "Logging in..." : "Log in"}
                </Button>
            </form>

            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="h-px flex-1 bg-border" />
            </div>

            <GoogleLoginButton />

            <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href={ROUTES.register} className="text-primary hover:underline">
                    Register
                </Link>
            </p>
        </div>
    );
}