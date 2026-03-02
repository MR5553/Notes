import { userType } from "./type";

declare global {
    namespace Express {
        export interface Request {
            user: userType;
            auth: userType;
        }
        interface User extends userType { }
    }
}