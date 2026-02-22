import { userType } from "./type";

declare global {
    namespace Express {
        export interface Request {
            user: userType;
            oauth: userType;
        }
        interface User extends userType { }
    }
}