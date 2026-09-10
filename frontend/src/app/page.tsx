"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { ROUTES } from "@/lib/constants";

export default function HomePage() {
  const router = useRouter();

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const isHydrated = useAuthStore(
    (state) => state.isHydrated
  );

  const hydrate = useAuthStore(
    (state) => state.hydrate
  );

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [isHydrated, hydrate]);

  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated) {
      router.replace(ROUTES.chat);
    } else {
      router.replace(ROUTES.login);
    }
  }, [isHydrated, isAuthenticated, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">
        Loading...
      </p>
    </main>
  );
}