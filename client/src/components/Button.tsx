import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import type { ComponentProps, ReactNode } from "react";

export const ButtonVariants = cva(
    "min-h-6 inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md font-medium transition-colors cursor-pointer select-none [&_svg]:pointer-events-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    {
        variants: {
            variant: {
                default: "bg-primary text-background hover:opacity-90",
                lime: "bg-secondary text-primary hover:opacity-90",
                destructive: "bg-primary text-text-destructive hover:opacity-90",
                outlined: "border border-border bg-secondry text-primary hover:bg-secondry-foreground",
                ghost: "text-primary hover:bg-secondry-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                icon: "text-primary hover:bg-secondry",
            },
            size: {
                default: "px-4 py-2.5 text-sm rounded-xl",
                sm: "px-2 py-1 text-sm justify-start",
                lg: "px-6 py-3 text-base",
                icon: "p-2 rounded-[10px]",
                icon_sm: "min-h-4 rounded p-0"
            },
        },
        defaultVariants: {
            variant: "default",
            size: "sm",
        },
    }
);

export interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof ButtonVariants> {
    children: ReactNode;
};


export function Button({ children, className, variant, size, ...props }: ButtonProps) {
    return (
        <button
            className={cn(ButtonVariants({ variant, size, className }))}
            {...props}
        >
            {children}
        </button>
    );
}