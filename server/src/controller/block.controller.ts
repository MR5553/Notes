import { Request, Response } from "express";
import { Blocks } from "../models/block.model";
import { Types } from "mongoose";
import { Pages } from "../models/page.model";


const createBlock = async (req: Request, res: Response) => {
    try {
        const { pageId, content } = req.body;

        if (!pageId || content === undefined) {
            return res.status(400).json({
                success: false,
                message: "pageId and content are required.",
            });
        }

        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pageId.",
            });
        }

        const page = await Pages.findOne({
            _id: pageId,
            authorId: req.user?.id,
        });

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Page not found.",
            });
        }

        const block = await Blocks.findOneAndUpdate(
            { pageId },
            { content },
            { new: true, upsert: true }
        );

        return res.status(201).json({
            success: true,
            block,
            message: "Block saved successfully.",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
};

const getBlockByPage = async (req: Request, res: Response) => {
    try {
        const pageId = req.params.pageId as string;

        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pageId."
            });
        }

        const block = await Blocks.findOne({ pageId });

        if (!block) {
            return res.status(404).json({
                success: false,
                message: "Block not found for this page."
            });
        }

        return res.status(200).json({
            success: true,
            block,
            message: "Blocks fetched successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred."
        });
    }
};

const updateBlock = async (req: Request, res: Response) => {
    try {
        const pageId = req.params.pageId as string;
        const { content } = req.body;

        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blockId."
            });
        }

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "Content is required."
            });
        }

        const block = await Blocks.findOneAndUpdate(
            { pageId },
            { content, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!block) {
            return res.status(404).json({
                success: false,
                message: "Block not found."
            });
        }

        return res.status(200).json({
            success: true,
            block,
            message: "Block updated successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred."
        });
    }
};

const deleteBlock = async (req: Request, res: Response) => {
    try {
        const pageId = req.params.pageId as string;

        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pageId.",
            });
        }

        await Blocks.deleteOne({ pageId });

        return res.status(200).json({
            success: true,
            message: "Block deleted successfully.",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
};


export {
    createBlock,
    getBlockByPage,
    updateBlock,
    deleteBlock
};