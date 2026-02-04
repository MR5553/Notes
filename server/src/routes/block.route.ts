import { Router } from "express";
import {
    createBlock,
    getBlockByPage,
    updateBlock,
    deleteBlock,
} from "../controller/block.controller";

const router = Router();

router.post("/block", createBlock);
router.get("/page/:pageId/block", getBlockByPage);
router.patch("page/:blockId/block", updateBlock);
router.delete("page/:blockId/block", deleteBlock);

export default router;