import { model, Schema } from "mongoose";
import type { Page } from "../types/type";

const pageSchema = new Schema<Page>({
    title: {
        type: String,
        default: "Untitled",
        trim: true,
    },
    icon: {
        type: String,
        default: null,
    },
    favorite: {
        type: Boolean,
        default: false,
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
    authorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });


pageSchema.virtual("children", {
    ref: "Page",
    localField: "_id",
    foreignField: "parent",
});

pageSchema.virtual("block", {
    ref: "Block",
    localField: "_id",
    foreignField: "pageId",
    justOne: true,
});

pageSchema.set("toJSON", { virtuals: true });
pageSchema.set("toObject", { virtuals: true });


export const Pages = model<Page>("Page", pageSchema);