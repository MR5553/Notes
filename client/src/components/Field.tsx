import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    start?: ReactNode;
    end?: ReactNode;
}

export default function Field({ type, name, value, className, placeholder, start, end, ...props }: InputProps) {
    return (
        <div className="relative flex items-center">
            {start && (
                <div className="absolute left-0 inset-y-0 flex items-center pl-2.5 pointer-events-none">
                    {start}
                </div>
            )}

            <input
                name={name}
                type={type}
                value={value}
                placeholder={placeholder}
                className={cn("block w-full md:text-sm text-base text-neutral-500 bg-neutral-50 p-2.5 border border-neutral-200 rounded-xl hover:border-neutral-400 disabled:border-none disabled:cursor-not-allowed outline-none", { "pl-8": start, "pr-8": end }, className
                )}
                autoComplete="off"
                {...props}
            />

            {end && (
                <div className="absolute right-0 inset-y-0 flex items-center pr-2.5">
                    {end}
                </div>
            )}
        </div>
    )
}