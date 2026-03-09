import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { randomInt } from "node:crypto"
import { Users } from "../models/user.model";
import { generateToken, option } from "../lib/utils";
import type { jwtActionToken, jwtToken, userType } from "../types/type";
import { Pages } from "../models/page.model";
import { Blocks } from "../models/block.model";


const Signup = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const exist = await Users.findOne({ "email": email });

        if (exist) {
            return res.status(409).json({
                success: false,
                message: "User already exists, please signin instead."
            });
        }

        const otp = String(randomInt(100000, 1000000));

        const user = await Users.create({
            name: name,
            email: email,
            password: password,
            otp: otp,
        })

        if (!user) {
            return res.status(500).json({
                success: false,
                message: "Erro while creating user."
            });
        }

        //await sendMail(user, otp);

        return res.status(201).json({
            user,
            success: true,
            message: `Verification email sent to ${email} ${otp}.`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}


const Signin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await Users.findOne({ "email": email }).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email. Please sign up.",
            });
        }

        if (!user.verified) {
            const token = user.generateActionToken("email_verify");
            const otp = String(randomInt(100000, 1000000));

            user.otp = otp;
            await user.save();

            return res.status(403).json({
                success: false,
                token: token,
                message: "Your email is not verified. A new verification code has been sent.",
            });
        }

        if (!await user.verifyPassword(password)) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password. Please try again.",
            });
        }

        const { refreshToken, accessToken } = await generateToken(user.id);

        return res.status(200)
            .cookie("accessToken", accessToken, option.access)
            .cookie("refreshToken", refreshToken, option.refresh)
            .json({
                user,
                success: true,
                message: "User sign in successfully.",
            });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}


const VerifyEmail = async (req: Request, res: Response) => {
    try {
        const { otp, token } = req.body;

        const secret = process.env.ACTION_TOKEN_SECRET as string;
        const payload = jwt.verify(token, secret) as jwtActionToken;

        if (payload.purpose !== "email_verify") {
            return res.status(400).json({
                success: false,
                message: "Invalid verification token."
            });
        }

        const user = await Users.findById(payload.id).select("+otp +otpExpiry");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Error while fetching data."
            });
        }

        if (user.verified) {
            return res.status(400).json({
                success: false,
                message: "User already verified!.. "
            });
        }

        if (!user.otpExpiry || user.otpExpiry <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Verification code has expired."
            });
        }

        if (!await user.verifyOtp(otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification code."
            });
        }

        const { accessToken, refreshToken } = await generateToken(user.id);

        const updatedUser = await Users.findByIdAndUpdate(user.id,
            {
                $set: {
                    verified: true,
                },
                $unset: {
                    otp: 1,
                    otpExpiry: 1,
                    token: 1
                },
            },
            { new: true }
        ) as userType;

        return res.status(200)
            .cookie("accessToken", accessToken, option.access)
            .cookie("refreshToken", refreshToken, option.refresh)
            .json({
                user: updatedUser,
                success: true,
                message: "Email verified successfully",
            });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}


const ResendOtp = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        const secret = process.env.ACTION_TOKEN_SECRET as string;
        const payload = jwt.verify(token, secret) as jwtActionToken;
        const otp = String(randomInt(100000, 1000000));

        if (!payload) {
            return res.status(404).json({
                success: false,
                message: "Invalid verification token."
            });
        }

        await Users.findByIdAndUpdate(payload.id,
            {
                $set: {
                    otp: otp,
                },
            },
            { new: true }
        );

        //await sendOtpEmail(user.email, user.otp);

        return res.status(200).json({
            success: true,
            message: "New otp code has been sent.",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}


const getProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated."
            });
        }

        return res.status(200).json({
            user: req.user,
            success: true,
            message: "current user fetched successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
};


const forgetPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const user = await Users.findOne({ email: email }) as userType;

        if (!user) {
            return res.status(200).json({
                success: false,
                message: "No such user exist with this email"
            });
        }

        const otp = String(randomInt(100000, 1000000));
        const token = user.generateActionToken("forget_password");

        user.otp = otp;
        await user.save();

        // send resetPasswordOtp(otp)

        return res.status(200).json({
            success: true,
            token: token,
            message: `Otp has been sent to ${user.email}`,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}


const verifyResetPasswordOtp = async (req: Request, res: Response) => {
    try {
        const { otp, token } = req.body;

        const secret = process.env.ACTION_TOKEN_SECRET as string;
        const payload = jwt.verify(token, secret) as jwtActionToken;

        if (payload.purpose !== "forget_password") {
            return res.status(400).json({
                success: false,
                message: "Invalid verification token."
            });
        }

        const user = await Users.findById(payload.id).select("+otp +otpExpiry");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Error while fetching data."
            });
        }

        if (!user.otpExpiry || user.otpExpiry <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Verification code has expired."
            });
        }

        if (!await user.verifyOtp(otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification code."
            });
        }

        await Users.findByIdAndUpdate(user.id,
            {
                $unset: {
                    otp: 1,
                    otpExpiry: 1
                },
            },
            { new: true }
        ) as userType;

        const password_reset = user.generateActionToken("password_reset");

        return res.status(201).json({
            success: true,
            token: password_reset,
            message: "Otp verified successfully, now reset password."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}


const ResetPassword = async (req: Request, res: Response) => {
    try {
        const { password, token } = req.body;

        const secret = process.env.ACTION_TOKEN_SECRET as string;
        const payload = jwt.verify(token, secret) as jwtActionToken;

        if (payload.purpose !== "password_reset") {
            return res.status(400).json({
                success: false,
                message: "Invalid reset token."
            });
        }

        const user = await Users.findById(payload.id) as userType;

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Error while fetching data."
            });
        }

        user.password = password;
        user.refreshToken = null;
        await user.save({ validateBeforeSave: true });

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. Please sign in with your new password.",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}


const refreshAccessToken = async (req: Request, res: Response) => {
    try {
        const token = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized request!.."
            });
        }

        const secret = process.env.REFRESH_TOKEN_SECRET as string;
        const payload = jwt.verify(token, secret) as jwtToken;

        const user = await Users.findById(payload.id).select("+refreshToken");

        if (!user || token !== user.refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token expired or invalid",
            });
        }

        const { accessToken, refreshToken } = await generateToken(user.id);

        return res.status(200)
            .cookie("accessToken", accessToken, option.access)
            .cookie("refreshToken", refreshToken, option.refresh)
            .json({
                success: true,
                message: "Access token and refresh token updated successfully!..",
            });

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError ||
            error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: "Refresh token expired or invalid",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }

}


const changePassword = async (req: Request, res: Response) => {
    try {
        const { password } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated."
            });
        }

        const user = await Users.findById(req.user.id).select("+password") as userType;

        if (await user.verifyPassword(password)) {
            return res.status(401).json({
                success: false,
                message: "password is same as old."
            });
        }

        user.password = password;
        await user.save({ validateBeforeSave: true });

        return res.status(200).json({
            user: user,
            success: true,
            message: "Password updated successfully.",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}


const deleteAccount = async (req: Request, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated."
            });
        }

        const user = await Users.findById(req.user.id) as userType;

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        await Pages.deleteMany({ authorId: user.id });
        await Blocks.deleteMany({ authorId: user.id });
        await user.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}


const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { name, avatar } = req.body;

        const user = await Users.findByIdAndUpdate(userId,
            {
                $set: {
                    name,
                    avatar,
                },
            },
            { new: true }
        ) as userType;

        return res.status(200).json({
            success: true,
            user,
            message: "Profile updated successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred."
        });
    }
}


const Logout = async (req: Request, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "User not authenticated." });
        }

        await Users.findByIdAndUpdate(
            req.user.id,
            {
                $unset: { refreshToken: 1 },
            },
            { new: true }
        );

        return res.status(200)
            .clearCookie("accessToken", option.access)
            .clearCookie("refreshToken", option.refresh)
            .json({
                success: true,
                message: "User logged out successfully.",
            });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
};


export {
    Signup,
    Signin,
    VerifyEmail,
    ResendOtp,

    forgetPassword,
    verifyResetPasswordOtp,
    ResetPassword,
    changePassword,

    getProfile,
    updateProfile,
    deleteAccount,

    refreshAccessToken,
    Logout,
};