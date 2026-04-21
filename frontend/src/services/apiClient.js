import axios from "axios";
import { useAppStore } from "../store/useAppStore";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/",
  timeout: 6000,
});

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/",
  timeout: 6000,
});

let refreshPromise = null;

const readAuth = () => {
  const raw = localStorage.getItem("gm_auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const refreshSession = async () => {
  const auth = readAuth();
  const refreshToken = auth?.refreshToken || auth?.user?.refreshToken;
  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }
  const res = await refreshClient.post("/api/v1/auth/refresh", { refreshToken });
  const data = res?.data?.data;
  if (!data?.token || !data?.refreshToken) {
    throw new Error("Invalid refresh response");
  }
  useAppStore.getState().updateAuthTokens({ token: data.token, refreshToken: data.refreshToken });
  return data.token;
};

apiClient.interceptors.request.use((config) => {
  const parsed = readAuth();
  if (parsed?.token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${parsed.token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config || {};
    const url = original?.url || "";
    const isAuthPath = url.includes("/api/v1/auth/login")
      || url.includes("/api/v1/auth/register")
      || url.includes("/api/v1/auth/refresh");

    if (status !== 401 || original._retry || isAuthPath) {
      return Promise.reject(error);
    }

    try {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = refreshSession().finally(() => {
          refreshPromise = null;
        });
      }
      const nextToken = await refreshPromise;
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${nextToken}`;
      return apiClient(original);
    } catch (refreshErr) {
      const { clearAuth, notify } = useAppStore.getState();
      clearAuth();
      notify("Session expired. Please login again.", "warning");
      const path = window.location?.pathname || "";
      if (path !== "/login" && path !== "/register") {
        window.location.assign("/login?reason=session_expired");
      }
      return Promise.reject(refreshErr);
    }
  }
);