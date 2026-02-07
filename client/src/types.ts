import type { JSONContent } from "@tiptap/react";

export interface userType {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar: string;
    providers: Provider[];
    refreshToken: string;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Provider {
    provider: "google" | "github" | "facebook" | "twitter" | "linkedin" | string;
    providerId: string;
}


export type Level = 1 | 2 | 3 | 4 | 5 | 6;

export interface Page {
    id: string;
    title: string;
    icon?: string;
    cover?: string;
    parent: string;
    workspaceId: string;
    authorId: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}


export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";
export interface workspace {
    id: string;
    name: string;
    icon: string;
    owner: string;
    settings: {
        theme: string;
        allowComments: boolean,
        allowSharing: boolean,
        defaultPageView: string;
    },
    visibility: string;
    archived: false,
    createdAt: string;
    updatedAt: string;
    role: WorkspaceRole;
}

export interface Block {
    id: string;
    pageId: string;
    content: JSONContent;
    createdAt: string;
    updatedAt: string;
}

export type Node = Page & {
    nodes: Node[];
};