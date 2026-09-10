import { motion } from "framer-motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-sm animate-fade-in">{children}</div>
            </div>
            <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-emerald-800 lg:flex lg:flex-col lg:justify-between p-12 text-primary-foreground">
                <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
                <span className="relative z-10 font-display text-xl font-semibold">AMIS</span>
                <div className="relative z-10 space-y-3">
                    <h2 className="font-display text-3xl font-semibold leading-tight">
                        20 years of mandi data,<br />finally usable.
                    </h2>
                    <p className="max-w-sm text-primary-foreground/80">
                        Real-time prices, arbitrage routes, and AI-powered advisory across
                        every major market in Punjab.
                    </p>
                </div>
            </div>
        </div>
    );
}