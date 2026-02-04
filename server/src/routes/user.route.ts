import { Router } from "express";
import { limiter } from "../middleware/limiter.middleware";
import { validate } from "../middleware/validate.middleware";
import { schema } from "../validation/user.validation";
import {
    Signup,
    Signin,
    VerifyEmail,
    resendOtp,

    forgetPassword,
    verifyResetPasswordOtp,
    resetPassword,
    changePassword,

    getProfile,
    updateProfile,
    deleteAccount,

    refreshAccessToken,
    Logout,
} from "../controller/user.controller";
import { verifyJwtToken } from "../middleware/auth.middleware";


const router = Router();


router.post("/auth/sign-up", limiter.auth, validate(schema.signup), Signup);
router.post("/auth/sign-in", limiter.auth, validate(schema.signin), Signin);
router.post("/auth/verify-email/:email", limiter.auth, validate(schema.verifyEmail), VerifyEmail);
router.post("/auth/resend-otp/:email", limiter.auth, resendOtp);

router.post("/password/forgot", validate(schema.email), forgetPassword);
router.post("/password/verify-otp/:email", validate(schema.verifyEmail), verifyResetPasswordOtp);
router.post("/password/reset/:email", validate(schema.resetPassword), resetPassword);
router.post("/password/change", validate(schema.changePassword), changePassword);

router.get("/users/me", verifyJwtToken, getProfile);
router.post("/users/me", verifyJwtToken, validate(schema.profile), updateProfile);
router.delete("/users/me", verifyJwtToken, validate(schema.password), deleteAccount);

router.post("/auth/logout", verifyJwtToken, Logout);
router.post("/auth/refresh-access-token", refreshAccessToken);


export default router;