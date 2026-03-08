import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/api";
import { isAxiosError, type AxiosResponse } from "axios";
import { toast } from "sonner";
import type { Page, CreatePagePayload } from "../types";

interface State {
    pages: Page[];
}

interface Actions {
    createPage: (parent?: string, isFavorite?: boolean) => Promise<void>;
    getPages: () => Promise<void>;
    getArchivePages: () => Promise<void>;
    updatePage: (pageId: string, payload: Partial<Page>) => Promise<void>;
    deletePage: (pageId: string) => Promise<void>;
    duplicatePage: (pageId: string) => Promise<void>;
    movePage: (pageId: string, parentId?: string) => Promise<void>;
    updateArchive: (pageId: string) => Promise<void>;
}

export const usePages = create<State & Actions>()(
    persist(
        (set) => ({
            pages: [],

            createPage: async (parent, isFavorite) => {
                const payload: CreatePagePayload = {
                    ...(parent && { parent }),
                    ...(isFavorite && { isFavorite: true }),
                };

                const promise = api.post("/api/pages", payload);
                toast.promise(promise, {
                    loading: "Creating page...",
                    success: (res) => {
                        if (res.data.success) {
                            const newPage = res.data.page;

                            set((state) => ({
                                pages: [...state.pages, newPage],
                            }));
                        }
                        return "Page created";
                    },
                    error: (err) => {
                        if (isAxiosError(err)) {
                            return err.response?.data?.message || "Create failed";
                        }
                        return "Something broke";
                    },
                });

                await promise;
            },

            getPages: async () => {
                const promise = api.get("/api/pages");

                toast.promise(promise, {
                    loading: "Fetching pages...",
                    success: (res: AxiosResponse) => {
                        set({ pages: res.data.pages });
                        return "Fetched";
                    },
                    error: (err) => {
                        if (isAxiosError(err)) {
                            return err.response?.data?.message || "Error while fetching";
                        }
                        return "Error while fetching";
                    },
                });

                await promise;
            },

            updatePage: async (pageId, payload) => {
                const promise = api.patch(`/api/pages/${pageId}`, payload);

                toast.promise(promise, {
                    loading: "Saving changes...",
                    success: (res) => {
                        const updatedPage = res.data.page;

                        set((state) => ({
                            pages: state.pages.map((p) =>
                                p.id === pageId ? updatedPage : p
                            ),
                        }));

                        return "Saved";
                    },
                    error: (err) => {
                        if (isAxiosError(err)) {
                            return err.response?.data?.message || "Update failed";
                        }
                        return "Update failed";
                    },
                });

                await promise;
            },

            duplicatePage: async (pageId) => {
                const promise = api.post(`/api/pages/${pageId}/duplicate`);

                toast.promise(promise, {
                    loading: "Duplicating page...",
                    success: (res) => {
                        const newPage = res.data.page;

                        set((state) => ({
                            pages: [...state.pages, newPage],
                        }));

                        return "Page duplicated";
                    },
                    error: (err) => {
                        if (isAxiosError(err)) {
                            return err.response?.data?.message || "Duplicate failed";
                        }
                        return "Duplicate failed";
                    },
                });

                await promise;
            },

            movePage: async (pageId, parentId) => {
                const promise = api.patch(`/api/pages/${pageId}/move`, { parentId });

                toast.promise(promise, {
                    loading: "Moving page...",
                    success: (res) => {
                        const updatedPage = res.data.page;

                        set((state) => ({
                            pages: state.pages.map((p) =>
                                p.id === pageId ? updatedPage : p
                            ),
                        }));

                        return "Page moved";
                    },
                    error: (err) => {
                        if (isAxiosError(err)) {
                            return err.response?.data?.message || "Move failed";
                        }
                        return "Move failed";
                    },
                });

                await promise;
            },

            getArchivePages: async () => {
                const promise = api.get("/api/pages/archived");

                toast.promise(promise, {
                    loading: "Fetching archived pages...",
                    success: (res) => {
                        set((state) => ({
                            pages: [...state.pages, ...res.data.pages],
                        }));
                        return "Archived pages fetched";
                    },
                    error: (err) =>
                        isAxiosError(err)
                            ? err.response?.data?.message || "Failed to fetch archived pages"
                            : "Something broke",
                });

                await promise;
            },

            updateArchive: async (pageId) => {
                const promise = api.patch(`/api/pages/${pageId}/un-archive`);

                toast.promise(promise, {
                    loading: "Restoring page...",
                    success: (res) => {
                        const updatedPage = res.data.page;

                        set((state) => ({
                            pages: state.pages.map((p) =>
                                p.id === pageId ? updatedPage : p
                            ),
                        }));

                        return "Page restored";
                    },
                    error: (err) =>
                        isAxiosError(err)
                            ? err.response?.data?.message || "Restore failed"
                            : "Restore failed",
                });

                await promise;
            },

            deletePage: async (pageId) => {
                const promise = api.delete(`/api/pages/${pageId}`);

                toast.promise(promise, {
                    loading: "Deleting page...",
                    success: () => {
                        set((state) => ({
                            pages: state.pages.filter((p) => p.id !== pageId),
                        }));
                        return "Deleted";
                    },
                    error: (err) => {
                        if (isAxiosError(err)) {
                            return err.response?.data?.message || "Deletion failed";
                        }
                        return "Deletion failed";
                    },
                });

                await promise;
            },
        }),
        {
            name: "pages",
        }
    )
);