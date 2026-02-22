import { Router } from "express";
import {
    createPage,
    getAllPages,
    getPageById,
    updatePage,
    archivePage,
    movePage,
    duplicatePage,
    deletePageById,
} from "../controller/page.controller";
import { verifyJwtToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/pages", verifyJwtToken, createPage);
router.get("/pages", verifyJwtToken, getAllPages);
router.get("/pages/:pageId", verifyJwtToken, getPageById);
router.patch("/pages/:pageId", verifyJwtToken, updatePage);
router.patch("/pages/:pageId/archive", verifyJwtToken, archivePage);
router.patch("/pages/:pageId/move", verifyJwtToken, movePage);
router.post("/pages/:pageId/duplicate", verifyJwtToken, duplicatePage);
router.delete("/pages/:pageId", verifyJwtToken, deletePageById);



export default router;