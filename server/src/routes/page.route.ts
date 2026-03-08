import { Router } from "express";
import {
    createPage,
    getPages,
    updatePage,
    updateArchive,
    getArchivePages,
    movePage,
    duplicatePage,
    deletePage,
} from "../controller/page.controller";
import { verifyJwtToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/pages", verifyJwtToken, getPages);
router.get("/pages/archived", verifyJwtToken, getArchivePages);
router.post("/pages", verifyJwtToken, createPage);
router.patch("/pages/:pageId", verifyJwtToken, updatePage);
router.patch("/pages/:pageId/archive", verifyJwtToken, updateArchive);
router.patch("/pages/:pageId/move", verifyJwtToken, movePage);
router.post("/pages/:pageId/duplicate", verifyJwtToken, duplicatePage);
router.delete("/pages/:pageId", verifyJwtToken, deletePage);



export default router;