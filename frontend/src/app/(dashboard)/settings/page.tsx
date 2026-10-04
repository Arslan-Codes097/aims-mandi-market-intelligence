import { PreferencesForm } from "@/components/settings/preferences-form";
import { AccountSection } from "@/components/settings/account-section";

export default function SettingsPage() {
    return (
        <div className="mx-auto max-w-xl space-y-10">
            <div className="space-y-1">
                <h1 className="font-display text-2xl font-semibold">Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your location, preferences, and account
                </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
                <PreferencesForm />
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
                <AccountSection />
            </div>

            {/* Mobile developer attribution */}
            <div className="block lg:hidden text-center space-y-1 text-muted-foreground/80 py-4">
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-foreground/80">
                    <span>Crafted with</span>
                    <span className="text-rose-500 animate-pulse text-xs">❤️</span>
                    <span>in Punjab</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                    &copy; 2026 AMIS Market Intelligence
                </p>
                <p className="text-[10px] text-muted-foreground/70 leading-tight">
                    By{" "}
                    <a
                        href="https://www.linkedin.com/in/arslan-babar-27516731a/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground/80 hover:text-primary transition-colors underline-offset-2 hover:underline"
                    >
                        Arslan Babar
                    </a>{" "}
                    &amp;{" "}
                    <span className="font-medium text-foreground/75">
                        Samama Zaid
                    </span>
                </p>
            </div>
        </div>
    );
}