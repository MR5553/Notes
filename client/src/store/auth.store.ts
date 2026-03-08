import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import type { userType } from "../types";
import { api } from "../lib/api";
import { toast } from "sonner";
import { isAxiosError } from "axios";

interface state {
    user: userType;
    hydrated: boolean;
    isAuthenticated: boolean;
}

export interface actions {
    Signin: (email: string, password: string) => Promise<void>;
    Signup: (name: string, email: string, password: string) => Promise<void>;
    VerifyEmail: (otp: string, email: string) => Promise<void>;
    ResendOtp: (email: string) => Promise<void>;
    getProfile: () => Promise<void>;
    SignOut: () => Promise<void>;
    setHydrated: () => void;
}

const initialState: state = {
    user: {
        id: "",
        name: "",
        email: "",
        phone: "",
        avatar: "",
        providers: [],
        verified: false,
        refreshToken: "",
        createdAt: "",
        updatedAt: ""
    },
    hydrated: false,
    isAuthenticated: false,
};

export const useAuth = create<state & actions>()(
    persist(
        immer((set) => ({
            ...initialState,

            Signup: async (name, email, password) => {
                const promise = api.post("/api/auth/sign-up", { name, email, password });

                toast.promise(promise, {
                    loading: "Creating account...",
                    success: (res) => {
                        if (res.data.success) {
                            set((state) => {
                                state.user = res.data.user;
                            });
                        }
                        return res.data.message || "Account created";
                    },
                    error: (err) => {
                        if (isAxiosError(err)) {
                            return err.response?.data?.message || "Signup failed";
                        }
                        return "Something went wrong";
                    }
                });

                await promise;
            },

            Signin: async (email, password) => {
                const promise = api.post("/api/auth/sign-in", { email, password });

                toast.promise(promise, {
                    loading: "Signing in...",
                    success: (res) => {
                        if (res.data.success) {
                            set((state) => {
                                state.user = res.data.user;
                                state.isAuthenticated = true;
                            });
                        }
                        return res.data.message || "Signed in";
                    },
                    error: (err) => {
                        if (isAxiosError(err)) {
                            return err.response?.data?.message || "Signin failed";
                        }
                        return "Something went wrong";
                    }
                });

                await promise;
            },

            VerifyEmail: async (otp, email) => {
                const promise = api.post(`/api/auth/verify-email/${email}`, { otp });

                toast.promise(promise, {
                    loading: "Verifying email...",
                    success: (res) => {
                        if (res.data.success) {
                            set((state) => {
                                state.user = res.data.user;
                                state.isAuthenticated = res.data.user.verified;
                            });
                        }
                        return res.data.message || "Verified";
                    },
                    error: (err) => {
                        if (isAxiosError(err)) {
                            return err.response?.data?.message || "Verification failed";
                        }
                        return "Something went wrong";
                    }
                });

                await promise;
            },

            ResendOtp: async (email) => {
                const promise = api.post(`/api/resend-otp/${email}`);

                toast.promise(promise, {
                    loading: "Sending OTP...",
                    success: (res) => res.data.message || "OTP sent",
                    error: (err) => {
                        if (isAxiosError(err)) {
                            return err.response?.data?.message || "Failed to resend OTP";
                        }
                        return "Something went wrong";
                    }
                });

                await promise;
            },

            getProfile: async () => {
                try {
                    const { data } = await api.get("/api/users/me");

                    if (data.success) {
                        set((state) => {
                            state.user = data.user;
                            state.isAuthenticated = true;
                        });
                    }
                } catch {
                    set(initialState);
                }
            },

            SignOut: async () => {
                const promise = api.post("/api/auth/logout");

                toast.promise(promise, {
                    loading: "Signing out...",
                    success: (res) => {
                        set(initialState);
                        return res.data.message || "Signed out";
                    },
                    error: (err) => {
                        if (isAxiosError(err)) {
                            return err.response?.data?.message || "Signout failed";
                        }
                        return "Something went wrong";
                    }
                });

                await promise;
            },

            setHydrated: () => set({ hydrated: true }),
        })),
        {
            name: "auth",
            onRehydrateStorage() {
                return (state, error) => {
                    if (!error) {
                        state?.setHydrated();
                    }
                };
            },
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);