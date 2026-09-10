"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChangePassword, useLogout } from "@/hooks/use-auth";

const schema = z.object({
    old_password: z.string().min(1, "Required"),
    new_password: z.string().min(8, "At least 8 characters"),
});
type FormValues = z.infer<typeof schema>;

export function AccountSection() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });
    const changePassword = useChangePassword();
    const logout = useLogout();

    const onSubmit = (values: FormValues) => {
        changePassword.mutate(values, { onSuccess: () => reset() });
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <label className="text-sm font-medium">Change password</label>
                <Input placeholder="Current password" type="password" {...register("old_password")} />
                {errors.old_password && (
                    <p className="text-xs text-destructive">{errors.old_password.message}</p>
                )}
                <Input placeholder="New password" type="password" {...register("new_password")} />
                {errors.new_password && (
                    <p className="text-xs text-destructive">{errors.new_password.message}</p>
                )}
                <Button type="submit" variant="outline" disabled={changePassword.isPending}>
                    {changePassword.isPending ? "Updating..." : "Update password"}
                </Button>
            </form>

            <div className="border-t border-border pt-4">
                <Button variant="destructive" onClick={() => logout.mutate()}>
                    Log out
                </Button>
            </div>
        </div>
    );
}