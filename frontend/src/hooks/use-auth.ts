"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
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
    User,
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
        onError: (err: any) => {
            const data = err?.response?.data;
            const message = data?.detail || data?.email?.[0] || data?.message || "Registration failed. Please check your details.";
            toast.error(message);
        },
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
            setUser(res.data.user);
            toast.success("Email verified.");
            router.push(ROUTES.onboarding);
        },
        onError: (err: any) => {
            const detail = err?.response?.data?.detail || "Invalid or expired code.";
            toast.error(detail);
        },
    });
}

export function useResendOtp() {
    return useMutation({
        mutationFn: (payload: ResendOtpPayload) =>
            apiClient.post<MessageResponse>("/auth/resend-otp/", payload),
        onSuccess: () => toast.success("A new code has been sent."),
        onError: (err: any) => {
            const detail = err?.response?.data?.detail || "Please wait before requesting another code.";
            toast.error(detail);
        },
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
            setUser(res.data.user);
            router.push(ROUTES.chat);
        },
        onError: (err: any, variables: any) => {
            const detail = err?.response?.data?.non_field_errors?.[0];
            if (detail === "Please verify your email before logging in.") {
                toast.error("Unverified email. Redirecting to verification...");
                const params = new URLSearchParams();
                params.set("email", variables.email);
                router.push(`${ROUTES.verifyEmail}?${params.toString()}`);
                return;
            }
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
            setUser(res.data.user);
            if (res.data.is_new_user) {
                router.push(ROUTES.onboarding);
            } else {
                router.push(ROUTES.chat);
            }
        },
        onError: (err: any) => {
            const detail = err?.response?.data?.detail || "Google sign-in failed.";
            toast.error(detail);
        },
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

export function useMe() {
    const setUser = useAuthStore((s) => s.setUser);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    return useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const { data } = await apiClient.get<User>("/auth/me/");
            setUser(data);
            return data;
        },
        enabled: isAuthenticated,
        retry: false,
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
export function useDeleteAccount() {
    const router = useRouter();
    const logout = useAuthStore((s) => s.logout);
    return useMutation({
        mutationFn: (payload: import('@/types/auth').DeleteAccountPayload) =>
            apiClient.delete('/auth/delete-account/', { data: payload }),
        onSuccess: () => {
            logout();
            tokenStorage.clear();
            toast.success('Account deleted. We are sorry to see you go!');
            router.push(ROUTES.login);
        },
        onError: (err: any) => {
            const detail = err?.response?.data?.password?.[0] || err?.response?.data?.confirmation_text?.[0] || 'Failed to delete account.';
            toast.error(detail);
        },
    });
}
