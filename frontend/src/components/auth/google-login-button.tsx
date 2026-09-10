"use client";

import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { useGoogleLogin } from "@/hooks/use-auth";

export function GoogleLoginButton() {
    const googleLogin = useGoogleLogin();

    return (
        <div className="flex justify-center">
            <GoogleLogin
                onSuccess={(credentialResponse) => {
                    if (!credentialResponse.credential) {
                        toast.error("Google sign-in failed. Please try again.");
                        return;
                    }
                    googleLogin.mutate({ id_token: credentialResponse.credential });
                }}
                onError={() => toast.error("Google sign-in failed. Please try again.")}
                theme="filled_black"
                shape="pill"
                width="320"
            />
        </div>
    );
}