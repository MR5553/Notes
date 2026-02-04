import { model, Schema } from "mongoose";
import type { Workspace } from "../types/type";

const workspaceSchema = new Schema<Workspace>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        icon: {
            type: String,
            trim: true,
            default: "",
        },
        slug: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        active: {
            type: Boolean,
            default: false
        },
        visibility: {
            type: String,
            enum: ["private", "team", "public"],
            default: "private",
        },
        archived: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

workspaceSchema.index({ "members.user": 1 });

workspaceSchema.virtual("pages", {
    ref: "Page",
    localField: "_id",
    foreignField: "workspaceId",
});

workspaceSchema.virtual("ownerInfo", {
    ref: "User",
    localField: "owner",
    foreignField: "_id",
    justOne: true,
});

export const Workspaces = model<Workspace>("Workspace", workspaceSchema);