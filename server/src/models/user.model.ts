import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { model, Schema } from "mongoose";
import { type userType } from "../types/type";


const userSchema = new Schema<userType>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, "invalid email format"],
    },
    password: {
        type: String,
        minlength: 8,
        select: false,
    },
    providers: [
        {
            provider: {
                type: String,
                enum: ["google", "github", "local"],
                default: "local"
            },
            providerId: { type: String }, // e.g., the Google 'sub' or GitHub 'id'
        }
    ],
    avatar: {
        type: String,
        default: "",
    },
    verified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
        select: false,
        default: null,
    },
    otpExpiry: {
        type: Date,
        select: false,
        default: null,
    },
    refreshToken: {
        type: String,
        default: "",
        select: false,
    },
}, { timestamps: true });


userSchema.pre("save", async function (next) {
    if (this.isModified("password") && this.password) {
        this.password = await bcrypt.hash(this.password, 12);
    }

    if (this.isModified("otp") && this.otp) {
        this.otp = await bcrypt.hash(this.otp, 10);
        this.otpExpiry = new Date(Date.now() + 60 * 60 * 1000);
    }

    return next();
});

userSchema.set("toJSON", {
    transform: function (_doc, ret) {
        ret.id = ret._id.toString();
        delete ret.password;
        delete ret.refreshToken;
        return ret;
    },
});

userSchema.set("toObject", {
    transform: function (_doc, ret) {
        ret.id = ret._id.toString();
        delete ret.password;
        delete ret.refreshToken;
        return ret;
    },
});

userSchema.methods.verifyPassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.verifyOtp = async function (otp: string) {
    return await bcrypt.compare(otp, this.otp);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this.id,
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: "5h"
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            id: this.id,
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: "7d"
        }
    );
};

export const Users = model<userType>("User", userSchema);