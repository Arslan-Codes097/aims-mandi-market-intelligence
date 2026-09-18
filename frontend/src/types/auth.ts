export interface User {
    id: string;
    email: string;
    full_name: string;
    is_verified: boolean;
    auth_provider: "email" | "google";
}

export interface AuthTokens {
    access: string;
    refresh: string;
    is_new_user?: boolean;
    user: User;
}

export interface RegisterPayload {
    email: string;
    password: string;
    full_name: string;
}

export interface VerifyEmailPayload {
    email: string;
    code: string;
}

export interface ResendOtpPayload {
    email: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface GoogleAuthPayload {
    id_token: string;
    mode?: "login" | "signup";
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    email: string;
    code: string;
    new_password: string;
}

export interface ChangePasswordPayload {
    old_password: string;
    new_password: string;
}

export interface MessageResponse {
    message: string;
}
export interface DeleteAccountPayload {
    password?: string;
    confirmation_text?: string;
}
