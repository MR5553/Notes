import { z } from "zod";


export const email = z.email("Invalid email").trim().toLowerCase();
export const password = z.string().min(8, "Password must be 8+ chars")
    .regex(/[A-Z]/, "Must include uppercase")
    .regex(/[0-9]/, "Must include number");

const name = z.string().min(3, "Name too short").max(50, "Name too long")
    .trim()
    .transform((val) => val.replace(/\s+/g, " "));


export const otp = z.string().regex(/^\d{6}$/, "OTP must be 6 digits")


export const resetPassword = z
    .object({
        password: password,
        confirm: z.string().min(8, "Confirm required"),
    })
    .refine((data) => data.password === data.confirm, {
        message: "Passwords do not match",
        path: ["confirm"],
    });


export const changePassword = z
    .object({
        new: password,
        confirm: z.string().min(8, "Confirm required"),
    })
    .refine((data) => data.new === data.confirm, {
        message: "Passwords do not match",
        path: ["confirm"],
    });


export const profile = z.object({
    name: z.string().min(3).max(50).optional().transform((val) => val?.replace(/\s+/g, " ")),
    email: email.optional(),
    avatar: z.string().url("Invalid avatar URL").optional(),
});

export const schema = {
    signup: z.object({ name, email, password }),
    signin: z.object({ email, password }),
    otp,
    resetPassword,
    changePassword,
    profile,
    email: z.object({ email }),
    password: z.object({ password }),
    verifyEmail: z.object({ otp }),
};
