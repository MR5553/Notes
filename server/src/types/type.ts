import type { Document, Types } from "mongoose";
import type { JwtPayload } from "jsonwebtoken";

export interface jwtToken extends JwtPayload {
    id: string;
}

export interface Page extends Document {
    title: string;
    icon?: string | null;
    cover?: string | null;
    parent: Types.ObjectId | null;
    isFavorite: boolean;
    authorId: Types.ObjectId;
    isArchived: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export interface OAuthProvider {
    provider: "google" | "github" | "local";
    providerId?: string;
}

export interface userType extends Document {
    email: string;
    name?: string | null;
    avatar?: string | null;
    password?: string;

    providers: OAuthProvider[];
    verified: boolean;

    otp?: string | null;
    otpExpiry?: Date | null;

    refreshToken?: string | null;

    generateRefreshToken(): string;
    generateAccessToken(): string;
    verifyPassword(password: string): Promise<boolean>;
    verifyOtp(otp: string): Promise<boolean>;
}