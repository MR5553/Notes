import { Router } from "express";
import { verifyJwtToken } from "../middleware/auth.middleware";
import { getSignature } from "../controller/upload.controller";


const router = Router();

router.post("/uploads/signature", verifyJwtToken, getSignature);

export default router;