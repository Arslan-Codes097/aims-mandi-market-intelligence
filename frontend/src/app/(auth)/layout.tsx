import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid min-h-screen lg:grid-cols-2 bg-background">
            {/* Left Column: Form & Public SaaS Footer */}
            <div className="flex min-h-screen flex-col justify-between p-6 sm:p-10">
                {/* Mobile Top Header */}
                <div className="flex items-center justify-between lg:hidden pb-2">
                    <Link href="/login" className="font-display text-lg font-bold text-primary tracking-tight">
                        AMIS
                    </Link>
                    <span className="text-[11px] font-medium text-muted-foreground">Mandi Intelligence</span>
                </div>

                {/* Form Card */}
                <div className="my-auto flex w-full justify-center py-6">
                    <div className="w-full max-w-sm animate-fade-in">{children}</div>
                </div>

                {/* Full SaaS Footer */}
                <footer className="w-full border-t border-border/50 pt-4 text-center text-xs text-muted-foreground space-y-2">
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium">
                        <a
                            href="mailto:support@amis-market-intelligence.me"
                            className="hover:text-primary transition-colors underline-offset-2 hover:underline"
                        >
                            Contact Support
                        </a>
                        <span className="text-muted-foreground/40">•</span>
                        <a
                            href="https://github.com/s-zaid-13/aims-mandi-market-intelligence"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors underline-offset-2 hover:underline"
                        >
                            GitHub
                        </a>
                        <span className="text-muted-foreground/40">•</span>
                        <a
                            href="https://www.linkedin.com/in/arslan-babar-27516731a/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors underline-offset-2 hover:underline"
                        >
                            Arslan Babar
                        </a>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="text-muted-foreground/80">
                            Samama Zaid
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] text-muted-foreground/70">
                        <span>&copy; 2026 AMIS: Mandi Market Intelligence. All rights reserved.</span>
                        <span className="hidden sm:inline text-muted-foreground/40">•</span>
                        <span className="inline-flex items-center gap-1">
                            <span>Crafted with</span>
                            <span className="text-rose-500 animate-pulse text-xs">❤️</span>
                            <span>in Punjab</span>
                        </span>
                    </div>
                </footer>
            </div>

            {/* Right Column: Branded Hero Showcase */}
            <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-emerald-800 lg:flex lg:flex-col lg:justify-between p-12 text-primary-foreground">
                <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
                <span className="relative z-10 font-display text-2xl font-bold tracking-tight">AMIS</span>
                
                <div className="relative z-10 space-y-4 max-w-md">
                    <h2 className="font-display text-3xl font-bold leading-tight">
                        20 years of mandi data,<br />finally usable.
                    </h2>
                    <p className="text-primary-foreground/80 text-sm leading-relaxed">
                        Real-time mandi prices, spatial arbitrage routes, and autonomous AI-powered market advisory across every major market in Punjab.
                    </p>
                </div>

                <div className="relative z-10 flex items-center justify-between text-xs text-primary-foreground/75 pt-6 border-t border-white/15">
                    <span>Developed by Arslan Babar &amp; Samama Zaid</span>
                    <span className="font-medium bg-white/10 px-2 py-0.5 rounded">v1.0 Production</span>
                </div>
            </div>
        </div>
    );
}