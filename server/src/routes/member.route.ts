import { Router } from "express";
import {
    addWorkspaceMember,
    getWorkspaceMembers,
    updateMemberRole,
    removeWorkspaceMember,
} from "../controller/workspaceMembers.controller";
import { verifyJwtToken } from "../middleware/auth.middleware";

const router = Router();

router.delete(
    "/workspaces/:id",
    verifyJwtToken,
    removeWorkspaceMember
)

router.post(
    "/workspaces/:id/members",
    verifyJwtToken,
    addWorkspaceMember
)
router.get(
    "/workspaces/:id/members",
    verifyJwtToken,
    getWorkspaceMembers
)
router.patch(
    "/workspaces/:id/members/:userId",
    verifyJwtToken,
    updateMemberRole
)