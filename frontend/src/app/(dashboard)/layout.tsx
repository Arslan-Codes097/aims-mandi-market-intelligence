"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { MandiDigestBanner } from "@/components/layout/mandi-digest-banner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuthStore } from "@/store/auth-store";
import { useMe } from "@/hooks/use-auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    useMe();
    const { isAuthenticated, isHydrated, hydrate } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    useEffect(() => {
        if (isHydrated && !isAuthenticated) router.replace("/login");
    }, [isHydrated, isAuthenticated, router]);

    if (!isHydrated) return null;

    const isChatPage = pathname?.startsWith("/chat");

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col min-w-0">
                <DashboardHeader />
                <MobileNav currentPath={pathname} />
                <main
                    className={
                        isChatPage
                            ? "flex flex-1 flex-col h-[calc(100vh-3.5rem)] p-2 sm:p-3 overflow-hidden"
                            : "flex-1 p-4 sm:p-6 lg:p-8"
                    }
                >
                    {!isChatPage && <MandiDigestBanner />}
                    {children}
                </main>
            </div>
        </div>
    );
}