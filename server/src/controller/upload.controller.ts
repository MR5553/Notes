import type { Request, Response } from "express";


import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function getSignature(_req: Request, res: Response) {
    try {
        const timestamp = Math.round(Date.now() / 1000);

        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp,
                folder: "Notes",
                upload_preset: "user_uploads",
            },
            process.env.CLOUDINARY_API_SECRET as string
        );

        return res.status(201).json({
            signature,
            timestamp,
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            folder: "Notes",
            uploadPreset: "user_uploads",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}