import { Response, Request, Router } from "express";
import passport from "passport";
import { userType } from "../types/type";
import { generateToken, option } from "../lib/utils";


const router = Router();


router.get("/auth/github", passport.authenticate("github", { scope: ["profile", "email"] }));
router.get("/auth/github/callback", passport.authenticate("github", {
    session: false, assignProperty: "oauth",
}),
    async (req: Request, res: Response) => {
        try {
            const user = req.oauth as userType;

            if (!user) {
                return res.redirect(`${process.env.CLIENT_ORIGIN}/sign-in?error=no_user`);
            }

            const { accessToken, refreshToken } = await generateToken(user.id);

            return res
                .status(200)
                .cookie("accessToken", accessToken, option.access)
                .cookie("refreshToken", refreshToken, option.refresh)
                .redirect(process.env.CLIENT_ORIGIN!);

        } catch (error) {
            console.error("GitHub login error:", error);
            res.redirect(
                `${process.env.CLIENT_ORIGIN}/sign-in?error=oauth_failed`
            );
        }
    }
);


router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google", {
    session: false, assignProperty: "oauth",
}),

    async (req: Request, res: Response) => {
        try {
            const user = req.oauth as userType;

            if (!user) {
                return res.redirect(`${process.env.CLIENT_ORIGIN}/sign-in?error=no_user`);
            }

            const { accessToken, refreshToken } = await generateToken(user.id);

            return res
                .status(200)
                .cookie("accessToken", accessToken, option.access)
                .cookie("refreshToken", refreshToken, option.refresh)
                .redirect(process.env.CLIENT_ORIGIN!);


        } catch (error) {
            console.error("GitHub login error:", error);
            res.redirect(
                `${process.env.CLIENT_ORIGIN}/sign-in?error=oauth_failed`
            );
        }
    }
);

export default router;