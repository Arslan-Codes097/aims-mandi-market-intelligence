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

    const [showDeleteModal, setShowDeleteModal] = useState(false);
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
        <div className="space-y-8">
            {/* Change Password Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-medium">Change password</h3>
                    <p className="text-sm text-muted-foreground">Update your password associated with your account.</p>
                </div>
                
                <div className="space-y-3">
                    <Input placeholder="Current password" type="password" {...register("old_password")} />
                    {errors.old_password && (
                        <p className="text-xs text-destructive">{errors.old_password.message}</p>
                    )}
                    <Input placeholder="New password" type="password" {...register("new_password")} />
                    {errors.new_password && (
                        <p className="text-xs text-destructive">{errors.new_password.message}</p>
                    )}
                    <Button type="submit" variant="default" disabled={changePassword.isPending}>
                        {changePassword.isPending ? "Updating..." : "Update password"}
                    </Button>
                </div>
            </form>

            {/* Danger Zone Actions */}
            <div className="border-t border-border pt-6 mt-6">
                <h3 className="text-sm font-medium text-destructive mb-4">Danger Zone</h3>
                <div className="flex items-center justify-between bg-destructive/5 border border-destructive/20 rounded-md p-4">
                    <Button variant="outline" onClick={() => logout.mutate()}>
                        Log out of session
                    </Button>
                    <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
                        Delete Account
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Modal (GitHub Style) */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border shadow-2xl rounded-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 space-y-4">
                            <h2 className="text-xl font-bold text-destructive">Delete your account</h2>
                            <p className="text-sm text-muted-foreground">
                                This action is permanent and cannot be undone. All of your preferences, watchlists, and chat history will be permanently wiped.
                            </p>
                            
                            <div className="space-y-2 pt-2">
                                <label className="text-sm font-medium">
                                    {user?.auth_provider === "google" 
                                        ? "Please type DELETE to confirm." 
                                        : "Please enter your password to confirm."}
                                </label>
                                <Input 
                                    type={user?.auth_provider === "google" ? "text" : "password"}
                                    placeholder={user?.auth_provider === "google" ? "DELETE" : "Your password"}
                                    value={deleteInput}
                                    onChange={(e) => setDeleteInput(e.target.value)}
                                    className="w-full"
                                    autoFocus
                                />
                            </div>
                        </div>
                        
                        <div className="bg-muted/50 p-4 border-t border-border flex justify-end space-x-2">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteInput("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleDeleteAccount}
                                disabled={deleteAccount.isPending || !deleteInput}
                            >
                                {deleteAccount.isPending ? "Deleting..." : "I understand, delete my account"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}