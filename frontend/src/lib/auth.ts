import type { AuthTokens } from "@/types/auth";

const ACCESS_KEY = "amis_access_token";
const REFRESH_KEY = "amis_refresh_token";

export const tokenStorage = {
    get access() {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(ACCESS_KEY);
    },
    get refresh() {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(REFRESH_KEY);
    },
    set(tokens: AuthTokens) {
        localStorage.setItem(ACCESS_KEY, tokens.access);
        localStorage.setItem(REFRESH_KEY, tokens.refresh);
    },
    setAccess(access: string) {
        localStorage.setItem(ACCESS_KEY, access);
    },
    clear() {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
    },
};