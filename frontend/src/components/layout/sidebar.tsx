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
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-border bg-card lg:flex select-none z-30">
            {/* Top: Branding & Navigation */}
            <div className="flex flex-col">
                <div className="flex h-16 items-center px-6">
                    <span className="font-display text-lg font-bold text-primary tracking-tight">AMIS</span>
                </div>

                <nav className="space-y-1 px-3">
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
                                        ? "bg-primary/10 text-primary font-semibold"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom: Logout & Developer Attribution */}
            <div className="p-3 space-y-2 border-t border-border/60 bg-muted/20">
                <button
                    onClick={() => logout.mutate()}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Log out</span>
                </button>

                <div className="pt-2 border-t border-border/40 px-2 space-y-1 text-muted-foreground/80">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                        <span>Crafted with</span>
                        <span className="text-rose-500 animate-pulse text-xs">❤️</span>
                        <span>in Punjab</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                        &copy; 2026 AMIS Market Intelligence
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 leading-tight">
                        By <span className="font-medium text-foreground/75">Arslan Babar</span> &amp;{" "}
                        <span className="font-medium text-foreground/75">Samama Zaid</span>
                    </p>
                </div>
            </div>
        </aside>
    );
}