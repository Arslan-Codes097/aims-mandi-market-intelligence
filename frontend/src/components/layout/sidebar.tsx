"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, TrendingUp, LineChart, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useLogout } from "@/hooks/use-auth";

const NAV_ITEMS = [
    { href: ROUTES.chat, label: "Chat", icon: MessageCircle },
    { href: ROUTES.arbitrage, label: "Arbitrage", icon: TrendingUp },
    { href: ROUTES.commodity("tomato"), label: "Commodity", icon: LineChart, matchPrefix: "/commodity" },
    { href: ROUTES.settings, label: "Settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const logout = useLogout();

    return (
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
            <div className="flex h-16 items-center px-6">
                <span className="font-display text-lg font-semibold text-primary">AMIS</span>
            </div>

            <nav className="flex-1 space-y-1 px-3">
                {NAV_ITEMS.map((item) => {
                    const active = item.matchPrefix
                        ? pathname.startsWith(item.matchPrefix)
                        : pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                active
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <button
                onClick={() => logout.mutate()}
                className="mx-3 mb-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
                <LogOut className="h-4 w-4" />
                Log out
            </button>
        </aside>
    );
}