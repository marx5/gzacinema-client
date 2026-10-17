import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { authApi } from "@/api/authApi";
import { queryClient } from "@/utils/queryClient";

export const useAuthStore = create(devtools((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: (userData, token) => {
        localStorage.setItem("token", token);
        queryClient.clear();
        set({ user: userData, isAuthenticated: true }, false, "auth/login");
    },

    logout: async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            localStorage.removeItem("token");
            queryClient.clear();
            set({ user: null, isAuthenticated: false }, false, "auth/logout");
        }
    },

    checkAuth: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            queryClient.removeQueries({ queryKey: ["profile"] });
            queryClient.removeQueries({ queryKey: ["user"] });
            set({ user: null, isLoading: false, isAuthenticated: false }, false, "auth/checkAuth_noToken");
            return;
        }
        try {
            const res = await authApi.getProfile();
            set({ user: res.data, isAuthenticated: true, isLoading: false }, false, "auth/checkAuth_success");
        } catch {
            queryClient.removeQueries({ queryKey: ["profile"] });
            queryClient.removeQueries({ queryKey: ["user"] });
            set({ user: null, isAuthenticated: false, isLoading: false }, false, "auth/checkAuth_fail");
        }
    }
}), { name: "AuthStore" }));