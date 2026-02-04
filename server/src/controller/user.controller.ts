import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { randomInt } from "node:crypto"
import { Users } from "../models/user.model";
import { generateToken, option } from "../lib/utils";
import type { jwtToken, userType } from "../types/type";
import { Pages } from "../models/page.model";


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

        const otp = randomInt(100000, 1000000);

        const user = await Users.create({
            name: name,
            email: email,
            password: password,
            otp,
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
            return res.status(403).json({
                userId: user.id,
                success: false,
                message: "Your email is not verified. Please check your inbox.",
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
        const { otp } = req.body;

        const user = await Users.findById(req.params.id).select("+otp +otpExpiry");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
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

        const updatedUser = await Users.findByIdAndUpdate(
            user.id,
            {
                $set: {
                    verified: true,
                },
                $unset: {
                    otp: 1,
                    otpExpiry: 1
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


const resendOtp = async (req: Request, res: Response) => {
    try {
        const user = await Users.findByIdAndUpdate(
            { email: req.params.id },
            {
                $set: {
                    otp: randomInt(100000, 1000000),
                },
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        //await sendOtpEmail(user.email, user.otp);

        return res.status(200).json({
            success: true,
            message: "New verfication code has been sent.",
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

        user.otp = otp;
        await user.save({ validateBeforeSave: false });

        // send resetPasswordOtp(otp)

        return res.status(200).json({
            success: true,
            message: `An instruction sent to ${user.email}`,
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
        const { otp } = req.body;

        const user = await Users.findOne({ email: req.params.email }).select("+otp +otpExpiry");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
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

        await Users.findByIdAndUpdate(
            user.id,
            {
                $unset: {
                    otp: 1,
                    otpExpiry: 1
                },
            },
            { new: true }
        ) as userType;

        return res.status(201).json({
            success: true,
            message: "Verified successfully, now reset password."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}


const resetPassword = async (req: Request, res: Response) => {
    try {
        const { password } = req.body;

        const user = await Users.findById(req.params.id) as userType;

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No such user found with this email."
            });
        }

        user.password = password;
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

        const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string) as jwtToken;

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


const updateProfile = async (_req: Request, _res: Response) => { }


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
};