"use client";

import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { Combobox } from "@/components/ui/combobox";
import { useCities } from "@/hooks/use-cities";
import { useCommodities } from "@/hooks/use-commodities";
import { useUpdatePreferences } from "@/hooks/use-preferences";
import { useMemo } from "react";

const OCCUPATION_OPTIONS = [
    { value: "Farmer", label: "Farmer" },
    { value: "Transporter", label: "Transporter" },
    { value: "Merchant/Trader", label: "Merchant/Trader" },
    { value: "Consumer", label: "Consumer" },
    { value: "Other", label: "Other" },
];

export default function OnboardingPage() {
    const { handleSubmit, control, formState: { isSubmitting } } = useForm({
        defaultValues: {
            home_city: "",
            occupation: "",
            preferred_commodities: [],
            watchlist: []
        }
    });
    const updatePreferences = useUpdatePreferences();
    const router = useRouter();
    const { data: cities = [] } = useCities();
    const { data: commodities = [] } = useCommodities();

    const cityOptions = useMemo(() => cities.map(c => ({ value: c, label: c })), [cities]);
    const commodityOptions = useMemo(() => commodities.map(c => ({ value: c, label: c })), [commodities]);

    const onSubmit = async (data: any) => {
        await updatePreferences.mutateAsync(data);
        router.push(ROUTES.chat);
    };

    const handleSkip = () => {
        router.push(ROUTES.chat);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="font-display text-2xl font-semibold">Personalize your experience</h1>
                <p className="text-sm text-muted-foreground">Tell us about your preferences to get a personalized experience. You can always change these later in Settings.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4 rounded-xl border p-4 bg-card/50">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">Home city</label>
                            <Controller
                                name="home_city"
                                control={control}
                                render={({ field }) => (
                                    <Combobox
                                        options={cityOptions}
                                        placeholder="Select city..."
                                        value={cityOptions.find(c => c.value === field.value) || null}
                                        onChange={(val: any) => field.onChange(val?.value || "")}
                                    />
                                )}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">Occupation</label>
                            <Controller
                                name="occupation"
                                control={control}
                                render={({ field }) => (
                                    <Combobox
                                        options={OCCUPATION_OPTIONS}
                                        placeholder="Select occupation..."
                                        value={OCCUPATION_OPTIONS.find(c => c.value === field.value) || null}
                                        onChange={(val: any) => field.onChange(val?.value || "")}
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Preferred commodities</label>
                        <Controller
                            name="preferred_commodities"
                            control={control}
                            render={({ field }) => (
                                <Combobox
                                    isMulti
                                    options={commodityOptions}
                                    placeholder="e.g. Tomato, Wheat"
                                    value={commodityOptions.filter(c => field.value?.includes(c.value))}
                                    onChange={(vals: any) => field.onChange(vals ? vals.map((v: any) => v.value) : [])}
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Watchlist</label>
                        <Controller
                            name="watchlist"
                            control={control}
                            render={({ field }) => (
                                <Combobox
                                    isMulti
                                    options={commodityOptions}
                                    placeholder="Commodities you want price alerts for"
                                    value={commodityOptions.filter(c => field.value?.includes(c.value))}
                                    onChange={(vals: any) => field.onChange(vals ? vals.map((v: any) => v.value) : [])}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button type="button" variant="outline" className="w-full" onClick={handleSkip}>
                        Skip
                    </Button>
                    <Button type="submit" className="w-full" disabled={isSubmitting || updatePreferences.isPending}>
                        {(isSubmitting || updatePreferences.isPending) ? "Saving..." : "Save Preferences"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
