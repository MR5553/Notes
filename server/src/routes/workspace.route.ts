import { Router } from "express";
import { verifyJwtToken } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { schema } from "../validation/workspace.validation";
import {
    createWorkspace,
    getAllWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    updateWorkspaceSettings,
    transferWorkspaceOwnership,
    archiveWorkspace,
} from "../controller/workspace.controller";


const router = Router();

router.post("/workspaces", validate(schema.workspace), verifyJwtToken, createWorkspace);
router.get("/workspaces", verifyJwtToken, getAllWorkspaces);
router.get("/workspaces/:id", verifyJwtToken, getWorkspaceById);
router.patch("/workspaces/:id", validate(schema.workspace), verifyJwtToken, updateWorkspace);
router.patch("/workspaces/:id/settings", verifyJwtToken, updateWorkspaceSettings);
router.post("/workspaces/:id/transfer", verifyJwtToken, transferWorkspaceOwnership);
router.delete("/workspaces/:id/archive", verifyJwtToken, archiveWorkspace);


export default router;