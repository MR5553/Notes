import z from "zod";

const isSingleEmoji = (value: string) => {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return [...segmenter.segment(value)].length === 1;
};

export const email = z.email("Invalid email").trim().toLowerCase();
export const password = z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "At least 1 uppercase letter")
    .regex(/[a-z]/, "At least 1 lowercase letter")
    .regex(/\d/, "At least 1 number")
    .regex(/[!@#$%^&*]/, "At least 1 special character")


export const signup = z.object({
    name: z
        .string()
        .min(3, "Name too short")
        .max(50, "Name too long")
        .trim()
        .transform((val) => val.replace(/\s+/g, " ")),
    email,
    password: password,
});

export const ResetPassword = z
    .object({
        password: password,
        confirm: z.string().min(8, "Confirm required"),
    })
    .refine((data) => data.password === data.confirm, {
        message: "Passwords do not match",
        path: ["confirm"],
    });

export const signin = z.object({
    email,
    password: password,
});

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

export const schema = {
    signin,
    signup,
    ResetPassword,
    workspace
}