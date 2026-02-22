import { Router } from "express";
import {
    createBlock,
    getBlockByPage,
    updateBlock,
    deleteBlock,
} from "../controller/block.controller";
import { verifyJwtToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/block", verifyJwtToken, createBlock);
router.get("/page/:pageId/block", verifyJwtToken, getBlockByPage);
router.patch("/block/:pageId", verifyJwtToken, updateBlock);
router.delete("/block/:pageId", verifyJwtToken, deleteBlock);

export default router;