import axios, { isAxiosError, type AxiosRequestConfig } from "axios";
import { toast } from "sonner";


declare module "axios" {
    export interface AxiosRequestConfig {
        _retry?: boolean;
    }
}

export const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL,
    withCredentials: true,
    timeout: 10000,
});

api.interceptors.response.use((res) => res,
    async (err) => {
        const originalRequest = err.config as AxiosRequestConfig & { _retry?: boolean };

        if (originalRequest.url?.endsWith("/auth/refresh-access-token")) {
            return Promise.reject(err);
        }

        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { data } = await api.post("/api/auth/refresh-access-token", {},
                    { withCredentials: true }
                );

                if (data?.success) {
                    return api(originalRequest);
                }

            } catch (error) {
                if (isAxiosError(error) && error.response) {
                    toast.error(error.response.data.message);
                    // window.location.href = "/sign-in";
                }
                return Promise.reject(error);
            }
        }

        return Promise.reject(err);
    }
);