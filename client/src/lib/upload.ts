import { api } from "./api";
import { IMAGE_MIME_TYPES, MAX_IMAGE_SIZE } from "./constant";


interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
}


export async function uploadImage(file: File): Promise<CloudinaryResponse> {
    if (!IMAGE_MIME_TYPES.includes(file.type)) {
        throw new Error("Unsupported image type");
    }
    if (file.size > MAX_IMAGE_SIZE) throw new Error("Image size exceeds 3MB");
    if (file.size === 0) throw new Error("Empty file");

    try {
        const { data } = await api.post("/api/uploads/signature");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", data.apiKey);
        formData.append("timestamp", data.timestamp);
        formData.append("signature", data.signature);
        formData.append("folder", data.folder);
        formData.append("upload_preset", data.uploadPreset);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`, {
            method: "POST",
            body: formData,
        })

        if (!response.ok) throw new Error("Image upload failed");
        return response.json();

    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Unable to upload image");
    }
}