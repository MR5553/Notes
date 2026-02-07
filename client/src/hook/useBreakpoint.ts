import { useEffect, useState } from "react";

type Breakpoint = "mobile" | "tablet" | "desktop" | "wide";

const queries: Record<Breakpoint, string> = {
    mobile: "(max-width: 639px)",
    tablet: "(min-width: 640px) and (max-width: 1023px)",
    desktop: "(min-width: 1024px) and (max-width: 1439px)",
    wide: "(min-width: 1440px)",
};

const getBreakpoint = (): Breakpoint => {
    if (window.matchMedia(queries.mobile).matches) return "mobile";
    if (window.matchMedia(queries.tablet).matches) return "tablet";
    if (window.matchMedia(queries.desktop).matches) return "desktop";
    return "wide";
};

export function useBreakpoint(): Breakpoint {
    const [breakpoint, setBreakpoint] = useState<Breakpoint>(getBreakpoint);

    useEffect(() => {
        const handler = () => setBreakpoint(getBreakpoint());

        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    return breakpoint;
}