import type { Document, ObjectId, Schema, Types } from "mongoose";
import type { JwtPayload } from "jsonwebtoken";


export interface jwtToken extends JwtPayload {
    id: string;
}


export interface pageType extends Document {
    title: string;
    icon?: string | null;
    cover?: string | null;
    parent: Types.ObjectId | null;
    workspaceId: ObjectId;
    authorId: ObjectId;
    order: number;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}


export interface Workspace {
    workspaceId: string;
    role: "owner" | "admin" | "member" | "guest";
}

export interface userType extends Document {
    email: string;
    name?: string | null;
    avatar?: string | null;
    password?: string;
    verified: boolean;
    otp?: string | null;
    otpExpiry?: Date | null;
    refreshToken?: string | null;
    workspaces?: Workspace[];

    generateRefreshToken(): string;
    generateAccessToken(): string;
    verifyPassword(password: string): Promise<boolean>;
    verifyOtp(otp: string): Promise<boolean>;
}

export interface Workspace extends Document {
    name: string;
    slug: string;
    icon?: string;
    owner: Schema.Types.ObjectId;
    members: {
        user: Schema.Types.ObjectId;
        role: "owner" | "admin" | "editor" | "viewer";
    }[];
    active: boolean;
    visibility: string;
    inviteLinks: {
        email: string;
        token: string;
        expiresAt: Date;
    }[];
    archived: boolean;
    transferredTo?: Schema.Types.ObjectId | null;
}
