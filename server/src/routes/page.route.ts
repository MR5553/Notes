import { Router } from "express";
import {
    createPage,
    getAllPages,
    updatePage,
    unArchivePage,
    getAllArchivePages,
    movePage,
    duplicatePage,
    deletePageById,
} from "../controller/page.controller";
import { verifyJwtToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/pages", verifyJwtToken, createPage);
router.get("/pages", verifyJwtToken, getAllPages);
router.patch("/pages/:pageId", verifyJwtToken, updatePage);
router.get("/pages/archived", verifyJwtToken, getAllArchivePages);
router.patch("/pages/:pageId/un-archive", verifyJwtToken, unArchivePage);
router.patch("/pages/:pageId/move", verifyJwtToken, movePage);
router.post("/pages/:pageId/duplicate", verifyJwtToken, duplicatePage);
router.delete("/pages/:pageId", verifyJwtToken, deletePageById);



export default router;