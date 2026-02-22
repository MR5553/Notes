import { Request, Response } from "express";
import { Pages } from "../models/page.model";
import { Types } from "mongoose";
import { Blocks } from "../models/block.model";


const createPage = async (req: Request, res: Response) => {
    try {
        const { parent } = req.body;

        const page = await Pages.create({
            title: "Untitled",
            parent: parent || null,
            authorId: req.user?.id,
        });

        if (!page) {
            return res.status(400).json({
                success: false,
                message: "Error while creating page."
            });
        }

        const block = await Blocks.create({
            pageId: page.id,
            content: page.title
        })

        if (!block) {
            return res.status(404).json({
                success: false,
                message: "Error while creating block for this page."
            });
        }

        return res.status(201).json({
            page,
            success: true,
            message: "Page created successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
};


const getAllPages = async (req: Request, res: Response) => {
    try {
        const pages = await Pages.find({
            authorId: req.user?.id,
            isArchived: false,
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            pages,
            message: "Pages fetched successfully."
        });

    } catch (error) {
        console.error("getAllPages error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pages",
        });
    }
};


const getPageById = async (req: Request, res: Response) => {
    try {
        const pageId = req.params.pageId as string;

        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pageId"
            });
        }

        const page = await Pages.findOne({
            _id: pageId,
            authorId: req.user?.id,
        });

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
};


const updatePage = async (req: Request, res: Response) => {
    try {
        const pageId = req.params.pageId as string;
        const { title, icon, cover, favorite } = req.body;

        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pageId",
            });
        }

        const payload: Record<string, any> = {};

        if (title !== undefined) payload.title = title;
        if (icon !== undefined) payload.icon = icon;
        if (cover !== undefined) payload.cover = cover;
        if (favorite !== undefined) payload.favorite = favorite;

        if (!Object.keys(payload).length) {
            return res.status(400).json({
                success: false,
                message: "No fields to update",
            });
        }

        const updated = await Pages.findOneAndUpdate(
            {
                _id: pageId,
                authorId: req.user?.id
            },
            {
                $set: {
                    payload
                }
            },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Page not found",
            });
        }

        return res.status(200).json({
            success: true,
            page: updated,
            message: "Page updated successfully.",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
};


const duplicatePage = async (req: Request, res: Response) => {
    const session = await Pages.startSession();

    try {
        session.startTransaction();

        const pageId = req.params.pageId as string;

        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pageId",
            });
        }

        const page = await Pages.findOne({
            _id: pageId,
            authorId: req.user?.id,
        }).session(session);

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Page not found",
            });
        }

        const block = await Blocks.findOne({ pageId }).session(session);

        if (!block) {
            return res.status(404).json({
                success: false,
                message: "Block not found",
            });
        }

        const duplicated = await Pages.create([{
            title: `${page.title} copy`,
            parent: page.parent || null,
            authorId: page.authorId,
            icon: page.icon,
            cover: page.cover,
            favorite: page.favorite
        }], { session });

        await Blocks.create([{
            pageId: duplicated[0].id,
            content: structuredClone(block.content),
        }], { session });

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            page: duplicated[0],
            message: "Page duplicated successfully",
        });

    } catch (error) {
        await session.abortTransaction();
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    } finally {
        session.endSession();
    }
};


const movePage = async (req: Request, res: Response) => {
    try {
        const pageId = req.params.pageId as string;
        const { parentId } = req.body;

        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pageId",
            });
        }

        if (parentId && !Types.ObjectId.isValid(parentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid parentId",
            });
        }

        if (parentId === pageId) {
            return res.status(400).json({
                success: false,
                message: "Page cannot be its own parent",
            });
        }

        const updated = await Pages.findOneAndUpdate(
            {
                _id: pageId,
                authorId: req.user?.id,
            },
            {
                parent: parentId || null,
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Page not found",
            });
        }

        return res.status(200).json({
            success: true,
            page: updated,
            message: "Page moved successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
};


const archivePage = async (req: Request, res: Response) => {
    try {
        const pageId = req.params.pageId as string;

        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pageId",
            });
        }

        const archived = await Pages.findOneAndUpdate(
            {
                _id: pageId,
                authorId: req.user?.id,
            },
            {
                isArchived: true,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!archived) {
            return res.status(404).json({
                success: false,
                message: "Page not found",
            });
        }

        await archiveChildren(archived.id);

        return res.status(200).json({
            success: true,
            page: archived,
            message: "Page archived successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
};


const restorePage = async (req: Request, res: Response) => {
    try {
        const pageId = req.params.pageId as string;

        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pageId",
            });
        }

        const restored = await Pages.findOneAndUpdate(
            {
                _id: pageId,
                authorId: req.user?.id,
            },
            {
                isArchived: false,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!restored) {
            return res.status(404).json({
                success: false,
                message: "Page not found",
            });
        }

        await restoreChildren(restored._id);

        return res.status(200).json({
            success: true,
            page: restored,
            message: "Page restored successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
};


const deletePageById = async (req: Request, res: Response) => {
    try {
        const pageId = req.params.pageId as string;

        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pageId",
            });
        }

        const page = await Pages.findOne({
            _id: pageId,
            authorId: req.user?.id,
        });

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Page not found",
            });
        }

        await deleteChildren(page.id);
        await Blocks.deleteOne({ pageId: page.id });
        await Pages.deleteOne({ _id: page.id });

        return res.status(200).json({
            success: true,
            message: "Page deleted successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
};

const deleteChildren = async (parentId: Types.ObjectId) => {
    const children = await Pages.find(
        { parent: parentId },
        { _id: 1 }
    );

    if (!children.length) return;

    for (const child of children) {
        await deleteChildren(child._id);
        await Blocks.deleteOne({ pageId: child._id });
        await Pages.deleteOne({ _id: child._id });
    }
};

const archiveChildren = async (parentId: Types.ObjectId) => {
    const children = await Pages.find(
        { parent: parentId },
        { _id: 1 }
    );

    if (!children.length) return;

    for (const child of children) {
        await Pages.updateOne(
            { _id: child._id },
            { isArchived: true }
        );

        await archiveChildren(child._id);
    }
};

const restoreChildren = async (parentId: Types.ObjectId) => {
    const children = await Pages.find(
        { parent: parentId },
        { _id: 1 }
    );

    if (!children.length) return;

    const childIds = children.map(c => c._id);

    await Pages.updateMany(
        { _id: { $in: childIds } },
        { isArchived: false }
    );

    for (const id of childIds) {
        await restoreChildren(id);
    }
};


export {
    createPage,
    getAllPages,
    getPageById,
    updatePage,
    archivePage,
    restorePage,
    movePage,
    duplicatePage,
    deletePageById,
};