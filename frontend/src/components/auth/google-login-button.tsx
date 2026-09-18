"use client";

import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { useGoogleLogin } from "@/hooks/use-auth";

interface GoogleLoginButtonProps {
    mode?: "login" | "signup";
    text?: string;
}

export function GoogleLoginButton({ mode = "login", text }: GoogleLoginButtonProps) {
    const googleLogin = useGoogleLogin();

    return (
        <div className="flex justify-center w-full">
            <GoogleLogin
                onSuccess={(credentialResponse) => {
                    if (!credentialResponse.credential) {
                        toast.error("Google sign-in failed. Please try again.");
                        return;
                    }
                    googleLogin.mutate({ id_token: credentialResponse.credential, mode });
                }}
                onError={() => toast.error("Google sign-in failed. Please try again.")}
                theme="filled_black"
                shape="pill"
                width="320"
                text={mode === "signup" ? "signup_with" : "signin_with"}
            />
        </div>
    );
}