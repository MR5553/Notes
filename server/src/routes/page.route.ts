import { Router } from "express";
import {
    createPage,
    getAllPages,
    getPageById,
    updatePageContent,
    deletePageById,
} from "../controller/page.controller";
import { verifyJwtToken } from "../middleware/auth.middleware";

const router = Router();

router.post(
    "/workspaces/:workspaceId/pages",
    verifyJwtToken,
    createPage
);

router.get(
    "/workspaces/:workspaceId/pages",
    verifyJwtToken,
    getAllPages
);

router.get(
    "/workspaces/:workspaceId/pages/:pageId",
    verifyJwtToken,
    getPageById
);

router.patch(
    "/workspaces/:workspaceId/pages/:pageId",
    verifyJwtToken,
    updatePageContent
);

router.delete(
    "/workspaces/:workspaceId/pages/:pageId",
    verifyJwtToken,
    deletePageById
);

export default router;