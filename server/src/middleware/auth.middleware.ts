import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Users } from "../models/user.model";
import { jwtToken } from "../types/type";


export async function verifyJwtToken(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token found, please sign in."
            });
        }

        const secret = process.env.ACCESS_TOKEN_SECRET as string;
        const decoded = jwt.verify(token, secret) as jwtToken;

        const user = await Users.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found"
            });
        }

        req.user = user;
        return next();

    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized: Invalid token"
        });
    }
}