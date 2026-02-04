import { Request, Response } from "express";
import { Workspaces } from "../models/workspace.model";


const addWorkspaceMember = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const { userId } = req.body;

        const workspace = await Workspaces.findById(workspaceId);

        if (!workspace) return res.status(404).json({
            success: false,
            message: "Workspace not found"
        });

        if (workspace.members.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "User already a member"
            });
        }

        workspace.members.push(userId);
        await workspace.save();

        return res.status(200).json({
            success: true,
            message: "Member added successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}

const getWorkspaceMembers = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;

        const workspace = await Workspaces.findById(workspaceId).populate(
            "members",
            "name email avatar"
        );

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found"
            });
        }

        return res.status(200).json({
            success: true,
            members: workspace.members,
            message: "All workspace member fetch successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}

const updateMemberRole = async (req: Request, res: Response) => {
    try {
        const { workspaceId, memberId } = req.params;
        const { role } = req.body;

        const workspace = await Workspaces.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found"
            });
        }

        const member = workspace.members.find((m: any) => m.user.toString() === memberId);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        member.role = role;
        await workspace.save();

        return res.status(200).json({
            success: true,
            message: "Member role updated"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}

const removeWorkspaceMember = async (req: Request, res: Response) => {
    try {
        const { workspaceId, memberId } = req.params;

        const workspace = await Workspaces.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found"
            });
        }

        workspace.members = workspace.members.filter((m: any) => m.toString() !== memberId);
        await workspace.save();

        return res.status(200).json({
            success: true,
            message: "Member removed successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}


export {
    addWorkspaceMember,
    getWorkspaceMembers,
    updateMemberRole,
    removeWorkspaceMember,
}