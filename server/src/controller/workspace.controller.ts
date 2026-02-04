import { Request, Response } from "express";
import { Workspaces } from "../models/workspace.model";


const createWorkspace = async (req: Request, res: Response) => {
    try {
        const { name, icon } = req.body;
        const owner = req.user.id || req.user._id;

        const workspace = await Workspaces.create({
            name,
            icon,
            owner: owner,
            members: [],
        });

        if (!workspace) {
            return res.status(400).json({
                success: true,
                message: "Facing error while creating workspace."
            });
        }

        return res.status(201).json({
            success: true,
            workspace,
            message: "Workspace created successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}

const getAllWorkspaces = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id || req.user._id;

        const workspaces = await Workspaces.find({
            archived: false,
            $or: [
                { owner: userId },
                { "members.user": userId },
            ],
        });

        if (!workspaces) {
            return res.status(400).json({
                success: true,
                message: "No workspace you have."
            });
        }

        return res.status(200).json({
            success: true,
            workspaces,
            message: "All worksapces fetched successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}

const getWorkspaceById = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user?.id;

        const workspace = await Workspaces.findOne({
            _id: workspaceId,
            archived: false,
            $or: [
                { owner: userId },
                { "members.user": userId },
            ],
        }).select("name slug visibility settings.theme owner members.user members.role");

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found or access denied",
            });
        }

        return res.status(200).json({
            success: true,
            workspace,
            message: "Worksapce fetched successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}

const updateWorkspace = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const { name, icon } = req.body;

        const updated = await Workspaces.findByIdAndUpdate(
            workspaceId,
            { name, icon },
            { new: true }
        ).select("name icon");

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found"
            });
        }

        return res.status(200).json({
            success: true,
            workspace: updated,
            message: "Worksapce updated successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}

const archiveWorkspace = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;

        const updated = await Workspaces.findByIdAndUpdate(
            workspaceId,
            { archived: true },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found to delete.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Workspace deleted successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}

const updateWorkspaceSettings = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const { settings } = req.body;

        const workspace = await Workspaces.findByIdAndUpdate(workspaceId,
            { settings },
            { new: true }
        );

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found"
            });
        }

        return res.status(200).json({
            success: true,
            workspace,
            message: "Workspace setting upadated."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}

const transferWorkspaceOwnership = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const { newOwnerId } = req.body;

        const workspace = await Workspaces.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found"
            });
        }

        workspace.owner = newOwnerId;
        await workspace.save();

        return res.status(200).json({
            success: true,
            message: "Ownership transferred"
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
    createWorkspace,
    getAllWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    archiveWorkspace,
    updateWorkspaceSettings,
    transferWorkspaceOwnership,
}