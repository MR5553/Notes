import rateLimit from "express-rate-limit";
import { Time } from "../lib/utils";


const globalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: "Too many requests",
            message: "Too many requests from this IP. Please try again later.",
            retryAfter: Time.format((req as any).rateLimit?.resetTime) || null,
        })
    }
})


const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: "Too many attempts. Please try again after 10 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: "Too many requests",
            message: "Too many attempts. Please try again after 10 minutes.",
            retryAfter: Time.format((req as any).rateLimit?.resetTime) || null,
        })
    }
})


const OtpLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 5,
    message: "Too many OTP requests. Please wait 10 minutes before trying again.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: "Too many requests",
            message: "Too many OTP requests. Please wait 10 minutes before trying again.",
            retryAfter: Time.format((req as any).rateLimit?.resetTime) || null,
        })
    }
})


const passwordLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 5,
    message: "Too many password reset attempts. Try again after 30 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: "Too many requests",
            message: "Too many password reset attempts. Try again after 30 minutes.",
            retryAfter: Time.format((req as any).rateLimit?.resetTime) || null,
        })
    }
})


export const limiter = {
    global: globalLimiter,
    auth: authLimiter,
    otp: OtpLimiter,
    password: passwordLimiter,
};
