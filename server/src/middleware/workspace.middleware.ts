import { NextFunction, Request, Response } from "express";

type Role = ("owner" | "admin" | "member" | "guest")[];

export default function authorizeRole(...roles: Role) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            return next({

            })
        }
    }
}