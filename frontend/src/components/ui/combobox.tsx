"use client";

import React from "react";
import Select, { Props as SelectProps } from "react-select";
import { useTheme } from "next-themes";

export interface ComboboxProps extends SelectProps {
    options: { value: string; label: string }[];
    isMulti?: boolean;
}

export function Combobox({ options, isMulti, ...props }: ComboboxProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const customStyles = {
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: "transparent",
            borderColor: "hsl(var(--border))",
            borderRadius: "0.5rem", // md
            minHeight: "2.5rem", // h-10
            boxShadow: state.isFocused ? "0 0 0 2px hsl(var(--ring))" : "none",
            "&:hover": {
                borderColor: "hsl(var(--border))",
            },
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: "hsl(var(--card))",
            borderRadius: "0.5rem",
            border: "1px solid hsl(var(--border))",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            zIndex: 50,
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused
                ? "hsl(var(--muted))"
                : "transparent",
            color: "hsl(var(--foreground))",
            cursor: "pointer",
            "&:active": {
                backgroundColor: "hsl(var(--muted))",
            },
        }),
        singleValue: (base: any) => ({
            ...base,
            color: "hsl(var(--foreground))",
        }),
        input: (base: any) => ({
            ...base,
            color: "hsl(var(--foreground))",
        }),
        multiValue: (base: any) => ({
            ...base,
            backgroundColor: "hsl(var(--primary))",
            borderRadius: "0.375rem",
        }),
        multiValueLabel: (base: any) => ({
            ...base,
            color: "hsl(var(--primary-foreground))",
            fontSize: "0.75rem",
        }),
        multiValueRemove: (base: any) => ({
            ...base,
            color: "hsl(var(--primary-foreground))",
            ":hover": {
                backgroundColor: "rgba(0,0,0,0.2)",
                color: "hsl(var(--primary-foreground))",
            },
        }),
    };

    return (
        <Select
            options={options}
            isMulti={isMulti}
            styles={customStyles}
            classNamePrefix="react-select"
            theme={(theme) => ({
                ...theme,
                colors: {
                    ...theme.colors,
                    primary: 'hsl(var(--ring))',
                },
            })}
            {...props}
        />
    );
}
