import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import type { ComponentProps, ReactNode } from "react";

export const ButtonVariants = cva(
    "min-h-6 inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-base text-gray-600 font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400 [&_svg]:pointer-events-none select-none",
    {
        variants: {
            variant: {
                default: "bg-layer-3 text-primary hover:bg-layer-4 border border-border-subtle",
                lime: "text-gray-900 bg-linear-to-r from-lime-200 via-lime-400 to-lime-500 shadow-lg shadow-lime-500/20",
                destructive: "bg-danger text-primary hover:opacity-90",
                outlined: "bg-layer-1 border border-border-default text-primary hover:bg-layer-2",
                ghost: "text-secondary hover:bg-layer-4",
                link: "text-primary underline-offset-4 hover:underline",
                icon: "text-secondary hover:bg-layer-2 outline outline-transparent",
            },
            size: {
                default: "px-4 py-2.5 text-sm rounded-xl",
                sm: "px-2 py-1 text-sm justify-start",
                lg: "px-6 py-3 text-base",
                icon: "p-2 rounded-[10px]",
                icon_sm: "min-h-4 rounded p-0"
            },
            state: {
                default: "",
                active: "bg-green-100 text-green-600 outline-border-default",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "sm",
            state: "default",
        },
    }
);

export interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof ButtonVariants> {
    children: ReactNode;
};


export function Button({ children, className, variant, size, state, ...props }: ButtonProps) {
    return (
        <button
            className={cn(ButtonVariants({ variant, size, state, className }))}
            {...props}
        >
            {children}
        </button>
    );
}