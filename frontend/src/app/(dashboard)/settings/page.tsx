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
        </div>
    );
}