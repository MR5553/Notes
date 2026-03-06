import { createContext, useContext, useState, type HTMLAttributes, type ImgHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";


type AvatarStatus = "loading" | "loaded";
type AvatarSize = "xs" | "sm" | "md" | "lg";
const avatarSizes = {
    xs: "size-6 text-xs",
    sm: "size-8 text-base",
    md: "size-10 text-2xl",
    lg: "size-12 text-3xl",
};
const groupSpacing = {
    lg: "-space-x-1",
    md: "-space-x-2",
    sm: "-space-x-3",
    xs: "-space-x-4",
};

type AvatarImageProps = ImgHTMLAttributes<HTMLImageElement>;

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    size?: AvatarSize;
}

interface AvatarFallbackProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    size?: AvatarSize;
    space?: AvatarSize;
}


const AvatarContext = createContext<{
    size: AvatarSize;
    status: AvatarStatus;
    setStatus: (s: AvatarStatus) => void;
} | null>(null);


export function Avatar({ children, className, size, ...props }: AvatarProps) {
    const group = useContext(AvatarContext);
    const AvatarSize = size ?? group?.size ?? "md";
    const [status, setStatus] = useState<AvatarStatus>("loading");

    return (
        <AvatarContext.Provider value={{ size: AvatarSize, status, setStatus }}>
            <div
                className={
                    cn("relative flex shrink-0 overflow-hidden rounded-xl bg-layer-3 border border-border-default",
                        avatarSizes[AvatarSize],
                        className
                    )
                }
                {...props}
            >
                {children}
            </div>
        </AvatarContext.Provider>
    );
}


export function AvatarImage({ src, className, ...props }: AvatarImageProps) {
    const ctx = useContext(AvatarContext);
    if (!ctx || !src) return null;

    return (
        <img
            src={src}
            loading="lazy"
            decoding="async"
            className={cn("size-full object-cover object-center", className)}
            onLoad={(e) => {
                ctx.setStatus("loaded");
                props.onLoad?.(e);
            }}
            onError={(e) => {
                ctx.setStatus("loading");
                props.onError?.(e);
            }}
            {...props}
        />
    );
}

export function AvatarFallback({ children, className, ...props }: AvatarFallbackProps) {
    const ctx = useContext(AvatarContext);
    if (!ctx || ctx.status === "loaded") return null;

    return (
        <div
            className={cn(
                "size-full grid place-content-center font-medium leading-none",
                avatarSizes[ctx.size],
                className
            )}
            {...props}
        >
            {children?.toString().charAt(0).toUpperCase()}
        </div>
    );
}

export function AvatarGroup({ children, className, size = "md", space = "md", ...props }: AvatarGroupProps) {
    return (
        <AvatarContext.Provider value={{ size, status: "loaded", setStatus: () => { } }}>
            <div
                className={cn("flex items-center", groupSpacing[space], className)}
                {...props}
            >
                {children}
            </div>
        </AvatarContext.Provider>
    )
}


Avatar.Image = AvatarImage;
Avatar.Group = AvatarGroup
Avatar.Fallback = AvatarFallback;