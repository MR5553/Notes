import { ZodError, ZodObject } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validate = (schema: ZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parse(req.body);
        return next();

    } catch (error: any) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.issues.map((issue) => ({
                    path: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }
    }
};