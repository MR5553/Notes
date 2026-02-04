import { Request, Response } from "express";
import { Blocks } from "../models/block.model";
import { Types } from "mongoose";


const createBlock = async (req: Request, res: Response) => {
    try {
        const { pageId, content } = req.body;

        if (!pageId || !content) {
            return res.status(400).json({ message: "pageId and content are required." });
        }

        const block = await Blocks.create({
            pageId,
            content,
        });

        if (!block) {
            return res.status(400).json({ message: "Error occure while inserting content." });
        }

        return res.status(201).json({
            success: true,
            block,
            message: "Block created successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
            error
        });
    }
}

const getBlockByPage = async (req: Request, res: Response) => {
    try {
        const { pageId } = req.params;

        if (!Types.ObjectId.isValid(pageId as string)) {
            return res.status(400).json({ message: "Invalid pageId" });
        }

        const block = await Blocks.findOne({ "pageId": pageId });

        if (!block) {
            return res.status(404).json({ message: "Error occure getting content." });
        }

        return res.status(200).json({
            success: true,
            block,
            message: "Block fetch successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
            error
        });
    }
}

const updateBlock = async (req: Request, res: Response) => {
    try {
        const { blockId } = req.params;
        const { content } = req.body;

        if (!Types.ObjectId.isValid(blockId as string)) {
            return res.status(400).json({ message: "Invalid Block id." });
        }

        if (!content) {
            return res.status(404).json({ message: "Content is required" });
        }

        const block = await Blocks.findByIdAndUpdate(blockId, { content }, { new: true });

        if (!block) {
            return res.status(404).json({ message: "Block not found" });
        }

        return res.status(200).json({
            success: true,
            block,
            message: "Block updated successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
            error
        });
    }
};

const deleteBlock = async (req: Request, res: Response) => {
    try {
        const { blockId } = req.params;

        if (!Types.ObjectId.isValid(blockId as string)) {
            return res.status(400).json({ message: "Invalid Block id." });
        }

        const block = await Blocks.findByIdAndDelete(blockId);

        if (!block) {
            return res.status(404).json({ message: "Block not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Block deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
            error
        });
    }
};

export {
    createBlock,
    getBlockByPage,
    updateBlock,
    deleteBlock
}