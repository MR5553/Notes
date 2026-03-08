import { Request, Response } from "express";
import { Pages } from "../models/page.model";
import { Types } from "mongoose";
import { Blocks } from "../models/block.model";


const createPage = async (req: Request, res: Response) => {
    try {
        const { parentId, isFavorite } = req.body;
        const userId = req.user?.id;

        if (!Types.ObjectId.isValid(parentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid parentId",
            });
        }

        const parent = await Pages.findOne({ _id: parentId, authorId: userId });

        const page = await Pages.create({
            title: "Untitled",
            parent: parent?.id || null,
            isFavorite: !!isFavorite,
            authorId: userId,
        });

        await Blocks.create({
            pageId: page.id,
            content: page.title,
        });

        return res.status(201).json({
            success: true,
            message: "Pages created successfully.",
            page,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
};


const getPages = async (req: Request, res: Response) => {
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


const updatePage = async (req: Request, res: Response) => {
    try {
        const pageId = req.params.pageId as string;
        const userId = req.user?.id;
        const { title, icon, cover, isFavorite } = req.body;


        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pageId",
            });
        }

        const updated = await Pages.findOneAndUpdate({ _id: pageId, authorId: userId },
            {
                $set: {
                    title: title,
                    icon: icon,
                    cover: cover,
                    isFavorite: isFavorite
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
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


const duplicatePage = async (req: Request, res: Response) => {
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

        const block = await Blocks.findOne({ pageId });

        if (!block) {
            return res.status(404).json({
                success: false,
                message: "Block not found",
            });
        }

        const duplicated = await Pages.create({
            title: `${page.title} copy`,
            parent: page.parent || null,
            authorId: page.authorId,
            icon: page.icon,
            cover: page.cover,
            isFavorite: page.isFavorite
        });

        await Blocks.create({
            pageId: duplicated.id,
            content: structuredClone(block.content),
        });
        return res.status(201).json({
            success: true,
            page: duplicated,
            message: "Page duplicated successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
};


const movePage = async (req: Request, res: Response) => {
    try {
        const parentId = req.body.parentId as string;
        const pageId = req.params.pageId as string;
        const userId = req.user?.id;

        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pageId"
            });
        }

        if (parentId && !Types.ObjectId.isValid(parentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid parentId"
            });
        }

        if (parentId === pageId) {
            return res.status(400).json({
                success: false,
                message: "Cannot self-parent"
            });
        }

        await moveChildren(new Types.ObjectId(pageId), new Types.ObjectId(parentId));

        const updated = await Pages.findOneAndUpdate({ _id: pageId, authorId: userId },
            {
                $set: {
                    parent: parentId
                }
            },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            page: updated,
            message: "All pages moved",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


const getArchivePages = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const archivedPages = await Pages.find({
            authorId: userId,
            isArchived: true,
        }).sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            pages: archivedPages,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }

};


const updateArchive = async (req: Request, res: Response) => {
    try {
        const pageId = req.params.pageId as string;
        const userId = req.user?.id;
        const { isArchived } = req.body

        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pageId",
            });
        }

        const page = await Pages.findOneAndUpdate({ _id: pageId, authorId: userId },
            {
                $set: {
                    isArchived: isArchived
                }
            },
            { new: true, runValidators: true }
        );

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Page not found",
            });
        }

        await updateChildrenArchive(page.id);

        return res.status(200).json({
            success: true,
            page: page,
            message: "updated successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


const deletePage = async (req: Request, res: Response) => {

    try {
        const pageId = req.params.pageId as string;
        const userId = req.user?.id;

        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pageId",
            });
        }

        const page = await Pages.findOne({
            _id: pageId,
            authorId: userId,
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
            message: "Deleted successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


const deleteChildren = async (parentId: Types.ObjectId) => {
    const children = await Pages.find({ parent: parentId });

    for (const child of children) {
        await deleteChildren(child.id);
        await Blocks.deleteOne({ pageId: child.id });
        await Pages.deleteOne({ _id: child.id });
    }
};

const updateChildrenArchive = async (parentId: Types.ObjectId) => {
    const children = await Pages.find({ parent: parentId }, { _id: 1 });

    if (!children.length) return;

    const childIds = children.map(c => c.id);

    await Pages.updateMany(
        { _id: { $in: childIds } },
        { isArchived: false }
    );

    for (const id of childIds) {
        await updateChildrenArchive(id);
    }
};

const moveChildren = async (pageId: Types.ObjectId, parentId: Types.ObjectId) => {
    const children = await Pages.find({ parent: pageId }, { _id: 1 });

    for (const child of children) {
        if (child._id.equals(parentId)) return;
        await moveChildren(child.id, parentId);
    }
};


export {
    createPage,
    getPages,
    updatePage,
    getArchivePages,
    updateArchive,
    movePage,
    duplicatePage,
    deletePage,
};