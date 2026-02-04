import { Request, Response } from "express";
import { Pages } from "../models/page.model";


const createPage = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const { title, content } = req.body;

        const page = await Pages.create({
            workspace: workspaceId,
            title,
            content
        });

        if (!page) {
            return res.status(400).json({
                success: true,
                message: "Error while creating page."
            });
        }

        return res.status(201).json({
            success: true,
            page,
            message: "Page created successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}

const getAllPages = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;

        if (!workspaceId) {
            return res.status(400).json({
                message: "workspaceId is required",
            });
        }

        const query: any = { workspaceId, isArchived: false };

        const pages = await Pages.find(query).sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            pages,
            message: "Pages fetched successfully."
        });

    } catch (error) {
        console.error("getAllPages error:", error);
        return res.status(500).json({
            message: "Failed to fetch pages",
        });
    }
}

const getPageById = async (req: Request, res: Response) => {
    try {
        const { pageId } = req.params;

        const page = await Pages.findById(pageId);

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Page not found"
            });
        }

        return res.status(200).json({
            success: true,
            page,
            message: "Page fetched successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}

const updatePageContent = async (req: Request, res: Response) => {
    try {
        const { pageId } = req.params;
        const { title, content } = req.body;

        const updated = await Pages.findByIdAndUpdate(
            pageId,
            {
                title,
                content
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Page not found"
            });
        }

        return res.status(200).json({
            success: true,
            page: updated,
            message: "Pages updated successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}

const deletePageById = async (req: Request, res: Response) => {
    try {
        const { pageId } = req.params;

        await Pages.findByIdAndDelete(pageId);

        return res.status(200).json({
            success: true,
            message: "Page deleted successfully"
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
    createPage,
    getAllPages,
    getPageById,
    updatePageContent,
    deletePageById,
}