import { model, Schema } from "mongoose";

const blockSchema = new Schema(
    {
        pageId: {
            type: Schema.Types.ObjectId,
            ref: "Page",
            required: true,
            unique: true
        },
        content: {
            type: Schema.Types.Mixed,
            required: true,
        },
    },
    { timestamps: true }
);


export const Blocks = model("Block", blockSchema);