import { z } from "zod";

const isSingleEmoji = (value: string) => {
    const segmenter = new (Intl as any).Segmenter("en", { granularity: "grapheme" });
    return [...segmenter.segment(value)].length === 1;
};

export const workspace = z.object({
    name: z
        .string()
        .min(3, "Name too short")
        .max(30, "Name too long")
        .trim()
        .transform((val) => val.replace(/\s+/g, " ")),
    icon: z
        .string()
        .refine(isSingleEmoji, {
            message: "Please select a single emoji",
        }),
});

export const pageSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Title is required.")
        .max(100, "Title must not exceed 100 characters."),
    content: z
        .string()
        .trim()
        .max(10000, "Content is too long. Try summarizing your life.")
        .optional(),
});

export const schema = {
    workspace,
    page: pageSchema
}