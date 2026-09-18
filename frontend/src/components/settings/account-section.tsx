"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChangePassword, useLogout, useDeleteAccount } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
    old_password: z.string().min(1, "Required"),
    new_password: z.string().min(8, "At least 8 characters"),
});
type FormValues = z.infer<typeof schema>;

export function AccountSection() {
    const user = useAuthStore((s) => s.user);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });
    
    const changePassword = useChangePassword();
    const logout = useLogout();
    const deleteAccount = useDeleteAccount();

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");

    const onSubmit = (values: FormValues) => {
        changePassword.mutate(values, { onSuccess: () => reset() });
    };

    const handleDeleteAccount = () => {
        if (user?.auth_provider === "google") {
            deleteAccount.mutate({ confirmation_text: deleteInput });
        } else {
            deleteAccount.mutate({ password: deleteInput });
        }
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

            <div className="border-t border-border pt-4 flex flex-col items-start space-y-4">
                <Button variant="outline" onClick={() => logout.mutate()}>
                    Log out
                </Button>
                
                <div className="w-full pt-6">
                    <h3 className="text-sm font-medium text-destructive mb-2">Danger Zone</h3>
                    {!showDeleteConfirm ? (
                        <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                            Delete Account
                        </Button>
                    ) : (
                        <div className="space-y-3 p-4 border border-destructive/20 rounded-md bg-destructive/5">
                            <p className="text-sm text-muted-foreground">
                                {user?.auth_provider === "google" 
                                    ? "This action is permanent. Please type DELETE to confirm." 
                                    : "This action is permanent. Please enter your password to confirm."}
                            </p>
                            <div className="flex space-x-2">
                                <Input 
                                    type={user?.auth_provider === "google" ? "text" : "password"}
                                    placeholder={user?.auth_provider === "google" ? "DELETE" : "Password"}
                                    value={deleteInput}
                                    onChange={(e) => setDeleteInput(e.target.value)}
                                    className="max-w-[250px]"
                                />
                                <Button 
                                    variant="destructive" 
                                    onClick={handleDeleteAccount}
                                    disabled={deleteAccount.isPending || !deleteInput}
                                >
                                    {deleteAccount.isPending ? "Deleting..." : "Confirm Delete"}
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeleteInput("");
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}