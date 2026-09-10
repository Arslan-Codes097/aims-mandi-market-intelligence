export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";

export const APP_NAME = "AMIS";

export const ROUTES = {
    login: "/login",
    register: "/register",
    verifyEmail: "/verify-email",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    chat: "/chat",
    arbitrage: "/arbitrage",
    commodity: (slug: string) => `/commodity/${slug}`,
    settings: "/settings",
} as const;