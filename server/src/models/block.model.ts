import { model, Schema } from "mongoose";

const blockSchema = new Schema(
    {
        pageId: {
            type: Schema.Types.ObjectId,
            ref: "Page",
            required: true,
        },
        content: {
            type: Object,
            required: true,
        },
    },
    { timestamps: true }
);

blockSchema.index({ pageId: 1, createdAt: 1 });


export const Blocks = model("Block", blockSchema);