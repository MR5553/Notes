import { Request, Response } from "express";
import { Pages } from "../models/page.model";
import { Types } from "mongoose";
import { Blocks } from "../models/block.model";


const createPage = async (req: Request, res: Response) => {
    try {
        const { parent, isFavorite } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (parent) {
            if (!Types.ObjectId.isValid(parent)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid parentId",
                });
            }

            const parentPage = await Pages.findOne({
                _id: parent,
                authorId: userId,
            });

            if (!parentPage) {
                return res.status(404).json({
                    success: false,
                    message: "Parent page not found",
                });
            }
        }

        const page = await Pages.create({
            title: "Untitled",
            parent: parent || null,
            isFavorite: !!isFavorite,
            authorId: userId,
        });

        await Blocks.create({
            pageId: page.id,
            content: page.title,
        });

        return res.status(201).json({
            success: true,
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


const updatePage = async (req: Request, res: Response) => {
    try {
        const pageId = req.params.pageId as string;
        const userId = req.user?.id;

        const { title, icon, cover, isFavorite, isArchived } = req.body;

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
        if (isFavorite !== undefined) payload.isFavorite = isFavorite;
        if (isArchived !== undefined) payload.isArchived = isArchived;

        if (!Object.keys(payload).length) {
            return res.status(400).json({
                success: false,
                message: "No fields to update",
            });
        }

        const updated = await Pages.findOneAndUpdate(
            { _id: pageId, authorId: userId },
            { $set: payload },
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
            isFavorite: page.isFavorite
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
        const parentId = req.body.parentId as string;
        const pageId = req.params.pageId as string;
        const userId = req.user?.id;

        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({ success: false, message: "Invalid pageId" });
        }

        if (parentId && !Types.ObjectId.isValid(parentId)) {
            return res.status(400).json({ success: false, message: "Invalid parentId" });
        }

        if (parentId === pageId) {
            return res.status(400).json({ success: false, message: "Cannot self-parent" });
        }

        if (parentId) {
            const cycle = await descendent(new Types.ObjectId(pageId), new Types.ObjectId(parentId));

            if (cycle) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot move page inside its descendant",
                });
            }
        }

        const updated = await Pages.findOneAndUpdate(
            { _id: pageId, authorId: userId },
            { parent: parentId || null },
            { new: true }
        );

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


const getAllArchivePages = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

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


const unArchivePage = async (req: Request, res: Response) => {
    try {
        const pageId = req.params.pageId as string;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pageId",
            });
        }

        const restored = await Pages.findOneAndUpdate(
            { _id: pageId, authorId: userId },
            { $set: { isArchived: false } },
            { new: true, runValidators: true }
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
            message: "Internal server error",
        });
    }
};


const deletePageById = async (req: Request, res: Response) => {
    const session = await Pages.startSession();

    try {
        session.startTransaction();

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
        }).session(session);

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Page not found",
            });
        }

        await deleteChildren(page.id, session);
        await Blocks.deleteOne({ pageId: page.id }).session(session);
        await Pages.deleteOne({ _id: page.id }).session(session);

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Deleted successfully",
        });

    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    } finally {
        session.endSession();
    }
};

const deleteChildren = async (parentId: Types.ObjectId, session: any) => {
    const children = await Pages.find({ parent: parentId }).session(session);

    for (const child of children) {
        await deleteChildren(child.id, session);
        await Blocks.deleteOne({ pageId: child.id }).session(session);
        await Pages.deleteOne({ _id: child.id }).session(session);
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

const descendent = async (pageId: Types.ObjectId, parentId: Types.ObjectId): Promise<boolean> => {
    const children = await Pages.find({ parent: pageId }, { _id: 1 });

    for (const child of children) {
        if (child.id.equals(parentId)) return true;

        const result = await descendent(child.id, parentId);
        if (result) return true;
    }

    return false;
};


export {
    createPage,
    getAllPages,
    updatePage,
    getAllArchivePages,
    unArchivePage,
    movePage,
    duplicatePage,
    deletePageById,
};