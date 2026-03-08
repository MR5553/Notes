import { create } from "zustand";
import { api } from "../lib/api";
import { toast } from "sonner";
import { isAxiosError, type AxiosResponse } from "axios";
import type { Block } from "../types";


type state = {
    block: Block | null;
}

type acion = {
    createBlock: (pageId: string, content: unknown) => Promise<void>
    getBlockByPage: (pageId: string) => Promise<void>
    updateBlock: (pageId: string, content: unknown) => Promise<void>
    deleteBlock: (pageId: string) => Promise<void>
}

export const useBlocks = create<state & acion>((set) => ({
    block: null,

    createBlock: async (pageId, content) => {
        const promise = api.post("/api/block", { pageId, content })

        toast.promise(promise, {
            loading: "Saving block...",
            success: (res: AxiosResponse) => {
                set({ block: res.data.block })
                return "Block saved"
            },
            error: (err) => {
                if (isAxiosError(err)) {
                    return err.response?.data?.message || "Save failed"
                }
                return "Something broke"
            },
        })

        await promise
    },

    getBlockByPage: async (pageId) => {
        const promise = api.get(`/api/block/${pageId}`)

        toast.promise(promise, {
            loading: "Fetching block...",
            success: (res: AxiosResponse) => {
                set({ block: res.data.block })
                return "Fetched"
            },
            error: (err) => {
                if (isAxiosError(err)) {
                    return err.response?.data?.message || "Fetch failed"
                }
                return "Something broke"
            },
        })

        await promise
    },

    updateBlock: async (pageId, content) => {
        const promise = api.patch(`/api/block/${pageId}`, { content })

        toast.promise(promise, {
            loading: "Updating block...",
            success: (res: AxiosResponse) => {
                set({ block: res.data.block })
                return "Updated"
            },
            error: (err) => {
                if (isAxiosError(err)) {
                    return err.response?.data?.message || "Update failed"
                }
                return "Something broke"
            },
        })

        await promise
    },

    deleteBlock: async (pageId) => {
        const promise = api.delete(`/api/block/${pageId}`)

        toast.promise(promise, {
            loading: "Deleting block...",
            success: () => {
                set({ block: null })
                return "Deleted"
            },
            error: (err) => {
                if (isAxiosError(err)) {
                    return err.response?.data?.message || "Delete failed"
                }
                return "Something broke"
            },
        })

        await promise
    }
}))