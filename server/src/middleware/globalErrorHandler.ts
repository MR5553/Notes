import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";


export const GlobalErrorHandler: ErrorRequestHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const message = err.message || err.cause;

    res.status(500).json({
        status: 500,
        message,
        success: false,
        errors: err.cause || [],
        stack: err.stack
    });
}