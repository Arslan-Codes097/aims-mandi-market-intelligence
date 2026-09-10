import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, ROUTES } from "@/lib/constants";
import { tokenStorage } from "@/lib/auth";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Separate instance for the refresh call itself — avoids interceptor recursion
const refreshClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use((config) => {
    const token = tokenStorage.access;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let isRefreshing = false;
let pendingQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null) {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error || !token) reject(error);
        else resolve(token);
    });
    pendingQueue = [];
}

apiClient.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status !== 401 || original._retry || !tokenStorage.refresh) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // Queue this request until the in-flight refresh resolves
            return new Promise((resolve, reject) => {
                pendingQueue.push({
                    resolve: (token) => {
                        original.headers.Authorization = `Bearer ${token}`;
                        resolve(apiClient(original));
                    },
                    reject,
                });
            });
        }

        original._retry = true;
        isRefreshing = true;

        try {
            const res = await refreshClient.post("/auth/refresh/", {
                refresh: tokenStorage.refresh,
            });
            tokenStorage.set(res.data); // was setAccess-only — rotation means a new refresh token comes back too
            const newAccess = res.data.access as string;
            apiClient.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
            flushQueue(null, newAccess);
            original.headers.Authorization = `Bearer ${newAccess}`;
            return apiClient(original);
        } catch (refreshError) {
            flushQueue(refreshError, null);
            tokenStorage.clear();
            if (typeof window !== "undefined") window.location.href = ROUTES.login;
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);