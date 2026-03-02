import { Response, Request, Router } from "express";
import passport from "passport";
import { userType } from "../types/type";
import { generateToken, option } from "../lib/utils";


const router = Router();
const CLIENT_URL = `${process.env.CLIENT_ORIGIN as string}/auth/success`;


router.get("/auth/github/callback", passport.authenticate("github", { session: false, assignProperty: "auth" }),
    async (req: Request, res: Response) => {
        try {
            const user = req.auth as userType;

            const { accessToken, refreshToken } = await generateToken(user.id);

            return res.status(200)
                .cookie("accessToken", accessToken, option.access)
                .cookie("refreshToken", refreshToken, option.refresh)
                .redirect(CLIENT_URL)

        } catch (error) {
            console.error("GitHub login error:", error);
            return res.redirect(CLIENT_URL)
        }
    }
);


router.get("/auth/google/callback", passport.authenticate("google", { session: false, assignProperty: "auth" }),
    async (req: Request, res: Response) => {
        try {
            const user = req.auth as userType;

            const { accessToken, refreshToken } = await generateToken(user.id);

            res.status(200)
            res.cookie("accessToken", accessToken, option.access)
            res.cookie("refreshToken", refreshToken, option.refresh)

            return res.status(200)
                .cookie("accessToken", accessToken, option.access)
                .cookie("refreshToken", refreshToken, option.refresh)
                .redirect(CLIENT_URL)

        } catch (error) {
            console.error("GitHub login error:", error);
            return res.redirect(CLIENT_URL)
        }
    }
);

export default router;