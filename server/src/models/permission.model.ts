import { Schema, Document, model, type ObjectId } from "mongoose";

export type PagePermission = "FULL_ACCESS" | "EDIT" | "COMMENT" | "VIEW";


export interface PageAccess extends Document {
    userId: ObjectId;
    pageId: ObjectId;
    permission: PagePermission;
}

const pageAccessSchema = new Schema<PageAccess>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        pageId: {
            type: Schema.Types.ObjectId,
            ref: "Page",
            required: true,
        },
        permission: {
            type: String,
            enum: ["FULL_ACCESS", "EDIT", "COMMENT", "VIEW"],
            required: true,
        },
    },
    { timestamps: true }
);


pageAccessSchema.virtual("user", {
    ref: "User",
    localField: "userId",
    foreignField: "_id",
    justOne: true,
});

pageAccessSchema.virtual("page", {
    ref: "Page",
    localField: "pageId",
    foreignField: "_id",
    justOne: true,
});

export const PageAccess = model<PageAccess>("PageAccess", pageAccessSchema);