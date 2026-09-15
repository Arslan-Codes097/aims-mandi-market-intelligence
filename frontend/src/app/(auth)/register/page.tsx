"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/hooks/use-auth";
import { ROUTES } from "@/lib/constants";
import { Combobox } from "@/components/ui/combobox";
import { useCities } from "@/hooks/use-cities";
import { useCommodities } from "@/hooks/use-commodities";
import { useMemo } from "react";

const OCCUPATION_OPTIONS = [
    { value: "Farmer", label: "Farmer" },
    { value: "Transporter", label: "Transporter" },
    { value: "Merchant/Trader", label: "Merchant/Trader" },
    { value: "Consumer", label: "Consumer" },
    { value: "Other", label: "Other" },
];

const schema = z.object({
    full_name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    confirm_password: z.string().min(8, "At least 8 characters"),
    home_city: z.string().optional(),
    occupation: z.string().optional(),
    preferred_commodities: z.array(z.string()).optional(),
    watchlist: z.array(z.string()).optional(),
}).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
    const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            preferred_commodities: [],
            watchlist: []
        }
    });
    const registerUser = useRegister();
    const { data: cities = [] } = useCities();
    const { data: commodities = [] } = useCommodities();

    const cityOptions = useMemo(() => cities.map(c => ({ value: c, label: c })), [cities]);
    const commodityOptions = useMemo(() => commodities.map(c => ({ value: c, label: c })), [commodities]);

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="font-display text-2xl font-semibold">Create your account</h1>
                <p className="text-sm text-muted-foreground">Start tracking mandi prices today</p>
            </div>

            <form onSubmit={handleSubmit((v) => registerUser.mutate(v))} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Input placeholder="Full name" {...register("full_name")} />
                        {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Input placeholder="Email" type="email" {...register("email")} />
                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Input placeholder="Password" type="password" {...register("password")} />
                            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Input placeholder="Confirm password" type="password" {...register("confirm_password")} />
                            {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 rounded-xl border p-4 bg-card/50">
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium">Personalize your experience</h3>
                        <p className="text-xs text-muted-foreground">Tell us about your preferences to get a personalized experience (you can change preferences in Settings)</p>
                    </div>
                    
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

                <Button type="submit" className="w-full" disabled={registerUser.isPending}>
                    {registerUser.isPending ? "Creating account..." : "Create account"}
                </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href={ROUTES.login} className="text-primary hover:underline">
                    Log in
                </Link>
            </p>
        </div>
    );
}