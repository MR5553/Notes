import type { CookieOptions } from "express";
import { Users } from "../models/user.model";
import type { userType } from "../types/type";


export async function generateToken(userId: string) {
    try {
        const user = await Users.findById(userId) as userType;

        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { refreshToken, accessToken };

    } catch (error) {
        throw new Error(`Token generation failed: ${(error as Error).message}`);
    }
};


export const option = {
    access: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 60 * 60 * 1000,
        path: "/",
    } as CookieOptions,
    refresh: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
    } as CookieOptions,
} as const;


export const Time = {
    format(date?: Date | number | null) {
        if (!date) return null;

        const target = typeof date === "number" ? new Date(date) : date;
        const diffMs = target.getTime() - Date.now();

        if (diffMs <= 0) return "now";

        const seconds = Math.ceil(diffMs / 1000);
        if (seconds < 60) return `in ${seconds} second${seconds > 1 ? "s" : ""}`;

        const minutes = Math.ceil(seconds / 60);
        if (minutes < 60) return `in ${minutes} minute${minutes > 1 ? "s" : ""}`;

        const hours = Math.ceil(minutes / 60);
        return `in ${hours} hour${hours > 1 ? "s" : ""}`;
    },
};