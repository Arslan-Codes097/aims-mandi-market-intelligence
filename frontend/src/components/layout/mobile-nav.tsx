"use client";

import Link from "next/link";
import { MessageCircle, TrendingUp, LineChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const NAV_ITEMS = [
    { href: ROUTES.chat, label: "Chat", icon: MessageCircle },
    { href: ROUTES.arbitrage, label: "Arbitrage", icon: TrendingUp },
    { href: ROUTES.commodity("tomato"), label: "Commodity", icon: LineChart, matchPrefix: "/commodity" },
    { href: ROUTES.settings, label: "Settings", icon: Settings },
];

export function MobileNav({ currentPath }: { currentPath: string }) {
    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 flex h-[calc(4rem+env(safe-area-inset-bottom))] border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
            {NAV_ITEMS.map((item) => {
                const active = item.matchPrefix ? currentPath.startsWith(item.matchPrefix) : currentPath === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "flex flex-1 flex-col items-center justify-center gap-1 text-xs",
                            active ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}