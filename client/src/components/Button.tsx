import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import type { ComponentProps, ReactNode } from "react";

export const ButtonVariants = cva(
    "min-h-6 inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-base text-gray-600 font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400 [&_svg]:pointer-events-none select-none",
    {
        variants: {
            variant: {
                default: "text-white bg-linear-to-r from-blue-500 via-blue-600 to-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50",
                lime: "text-gray-900 bg-linear-to-r from-lime-200 via-lime-400 to-lime-500 shadow-lg shadow-lime-500/20",
                destructive: "bg-red-100 text-red-600 hover:bg-red-200",
                outlined: "bg-neutral-100 border border-neutral-200 hover:border-neutral-400",
                ghost: "text-neutral-600 hover:bg-[#f2f1f0]",
                link: "text-primary underline-offset-4 hover:underline",
                icon: "hover:bg-[#f2f1f0] outline outline-transparent",
            },
            size: {
                default: "px-4 py-2.5 text-sm rounded-xl",
                sm: "px-2 py-1 text-sm justify-start",
                lg: "px-6 py-3 text-base",
                icon: "px-2 py-1 rounded-xl"
            },
            state: {
                default: "",
                active: "bg-blue-100 text-blue-600 outline-blue-200",
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