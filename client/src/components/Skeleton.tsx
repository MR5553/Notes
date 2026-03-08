import type { HTMLAttributes } from "react";
import { cn } from "../lib/utils";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "rect" | "circle";
}


export default function Skeleton({ variant = "rect", className, ...props }: SkeletonProps) {
    return (
        <div
            role="status"
            aria-label="Loading..."
            className={cn("animate-pulse bg-secondry-foreground",
                variant === "circle" ? "rounded-full" : "rounded", "min-h-6",
                className
            )}
            {...props}
        />
    )
}