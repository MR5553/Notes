import { model, Schema } from "mongoose";
import type { pageType } from "../types/type";

const pageSchema = new Schema<pageType>(
    {
        title: {
            type: String,
            default: "Untitled",
            trim: true,
        },
        icon: {
            type: String,
            default: null,
        },
        cover: {
            type: String,
            default: null,
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: "Page",
            default: null,
        },
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);


pageSchema.virtual("children", {
    ref: "Page",
    localField: "_id",
    foreignField: "parent",
});

pageSchema.virtual("blocks", {
    ref: "Block",
    localField: "_id",
    foreignField: "pageId",
});


export const Pages = model<pageType>("Page", pageSchema);