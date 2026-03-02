import { userType } from "./type";
import mongoose from "mongoose";

declare global {
    namespace Express {
        export interface Request {
            user: userType;
            auth: userType;
        }
        interface User extends userType { }
    }
}

declare global {
    var mongoose: {
        conn: mongoose | null;
        promise: Promise<mongoose> | null;
    };
}