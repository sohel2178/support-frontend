import axios, { AxiosError } from "axios";

import { API_URL } from "@/lib/config";
import { useAuthStore } from "@/store/auth.store";

const API = axios.create({
  baseURL: `${API_URL}/api`,
});

API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Session expired / account disabled → sign out everywhere.
API.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const isLogin = error.config?.url?.includes("/auth/login");

    if (error.response?.status === 401 && !isLogin && typeof window !== "undefined") {
      useAuthStore.getState().logout();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "Cannot reach the server. Please check your connection.";
    const data = error.response.data as { message?: string } | undefined;
    return data?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export default API;
