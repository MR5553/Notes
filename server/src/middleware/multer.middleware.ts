import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";


const storage = multer.diskStorage({
    destination(_req, _file, cb) {
        cb(null, "./public/temp");
    },
    filename(_req, file, cb) {
        const ext = path.extname(file.originalname);

        const originalName = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9-_]/g, "_")
            .replace(/_+/g, "_")
            .substring(0, 20);

        const randomId = crypto.randomBytes(6).toString("hex");

        const name = `${originalName}-${randomId}${ext}`;

        cb(null, name);
    }
});

export const uploadFile = multer({ storage: storage });