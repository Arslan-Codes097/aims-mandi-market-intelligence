"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { tokenStorage } from "@/lib/auth";
import { useAuthStore } from "@/store/auth-store";
import { ROUTES } from "@/lib/constants";
import type {
    AuthTokens,
    ChangePasswordPayload,
    ForgotPasswordPayload,
    GoogleAuthPayload,
    LoginPayload,
    MessageResponse,
    RegisterPayload,
    ResendOtpPayload,
    ResetPasswordPayload,
    VerifyEmailPayload,
} from "@/types/auth";

export function useRegister() {
    const router = useRouter();
    return useMutation({
        mutationFn: (payload: RegisterPayload) =>
            apiClient.post<MessageResponse>("/auth/register/", payload),
        onSuccess: (_, variables) => {
            toast.success("Check your email for the verification code.");
            router.push(`${ROUTES.verifyEmail}?email=${encodeURIComponent(variables.email)}`);
        },
        onError: () => toast.error("Registration failed. Please check your details."),
    });
}

export function useVerifyEmail() {
    const router = useRouter();
    const setUser = useAuthStore((s) => s.setUser);
    return useMutation({
        mutationFn: (payload: VerifyEmailPayload) =>
            apiClient.post<AuthTokens>("/auth/verify-email/", payload),
        onSuccess: (res) => {
            tokenStorage.set(res.data);
            setUser({ id: "", email: "", full_name: "", is_verified: true, auth_provider: "email" });
            toast.success("Email verified.");
            router.push(ROUTES.chat);
        },
        onError: () => toast.error("Invalid or expired code."),
    });
}

export function useResendOtp() {
    return useMutation({
        mutationFn: (payload: ResendOtpPayload) =>
            apiClient.post<MessageResponse>("/auth/resend-otp/", payload),
        onSuccess: () => toast.success("A new code has been sent."),
        onError: () => toast.error("Please wait before requesting another code."),
    });
}

export function useLogin() {
    const router = useRouter();
    const setUser = useAuthStore((s) => s.setUser);
    return useMutation({
        mutationFn: (payload: LoginPayload) =>
            apiClient.post<AuthTokens>("/auth/login/", payload),
        onSuccess: (res) => {
            tokenStorage.set(res.data);
            setUser({ id: "", email: "", full_name: "", is_verified: true, auth_provider: "email" });
            router.push(ROUTES.chat);
        },
        onError: (err: any) => {
            const detail = err?.response?.data?.non_field_errors?.[0];
            toast.error(detail ?? "Invalid email or password.");
        },
    });
}

export function useGoogleLogin() {
    const router = useRouter();
    const setUser = useAuthStore((s) => s.setUser);
    return useMutation({
        mutationFn: (payload: GoogleAuthPayload) =>
            apiClient.post<AuthTokens>("/auth/google/", payload),
        onSuccess: (res) => {
            tokenStorage.set(res.data);
            setUser({ id: "", email: "", full_name: "", is_verified: true, auth_provider: "google" });
            router.push(ROUTES.chat);
        },
        onError: () => toast.error("Google sign-in failed."),
    });
}

export function useForgotPassword() {
    return useMutation({
        mutationFn: (payload: ForgotPasswordPayload) =>
            apiClient.post<MessageResponse>("/auth/forgot-password/", payload),
        onSuccess: () => toast.success("If that email exists, a reset code has been sent."),
    });
}

export function useResetPassword() {
    const router = useRouter();
    return useMutation({
        mutationFn: (payload: ResetPasswordPayload) =>
            apiClient.post<MessageResponse>("/auth/reset-password/", payload),
        onSuccess: () => {
            toast.success("Password reset. Please log in.");
            router.push(ROUTES.login);
        },
        onError: () => toast.error("Invalid or expired code."),
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: (payload: ChangePasswordPayload) =>
            apiClient.post<MessageResponse>("/auth/change-password/", payload),
        onSuccess: () => toast.success("Password changed successfully."),
        onError: () => toast.error("Old password is incorrect."),
    });
}

export function useLogout() {
    const router = useRouter();
    const logout = useAuthStore((s) => s.logout);
    return useMutation({
        mutationFn: () =>
            apiClient.post("/auth/logout/", { refresh: tokenStorage.refresh }),
        onSettled: () => {
            logout();
            router.push(ROUTES.login);
        },
    });
}