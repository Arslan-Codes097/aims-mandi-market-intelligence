"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/hooks/use-auth";
import { ROUTES } from "@/lib/constants";
import { GoogleLoginButton } from "@/components/auth/google-login-button";

const schema = z.object({
    full_name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    confirm_password: z.string().min(8, "At least 8 characters"),
}).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema)
    });
    const registerUser = useRegister();

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="font-display text-2xl font-semibold">Create your account</h1>
                <p className="text-sm text-muted-foreground">Start tracking mandi prices today</p>
            </div>

            <form onSubmit={handleSubmit((v) => registerUser.mutate(v))} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Input placeholder="Full name" {...register("full_name")} />
                        {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Input placeholder="Email" type="email" {...register("email")} />
                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Input placeholder="Password" type="password" {...register("password")} />
                            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Input placeholder="Confirm password" type="password" {...register("confirm_password")} />
                            {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
                        </div>
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={registerUser.isPending}>
                    {registerUser.isPending ? "Creating account..." : "Create account"}
                </Button>
            </form>

            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="h-px flex-1 bg-border" />
            </div>

            <GoogleLoginButton mode="signup" />

            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href={ROUTES.login} className="text-primary hover:underline">
                    Log in
                </Link>
            </p>
        </div>
    );
}