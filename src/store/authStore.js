import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),

      /* ── Login ── */
      login: async ({ identifier, password }) => {
        const { data } = await api.post("/auth/login", { identifier, password });
        const payload = data?.data || {};
        const user = payload.user
          ? {
              ...payload.user,
              role: payload.user.role || payload.role || null,
            }
          : null;
        const accessToken = payload?.tokens?.accessToken || payload?.token || null;
        const refreshToken = payload?.tokens?.refreshToken || payload?.refreshToken || null;
        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        if (user?.role) localStorage.setItem("role", String(user.role).toLowerCase());
        set({ user, accessToken, refreshToken, isAuthenticated: Boolean(user && accessToken) });
        return user;
      },

      /* ── Register ── */
      register: async (payload) => {
        const { data } = await api.post("/auth/register", payload);
        const result = data?.data || {};
        const user = result.user
          ? {
              ...result.user,
              role: result.user.role || result.role || null,
            }
          : null;
        const accessToken = result?.tokens?.accessToken || result?.token || null;
        const refreshToken = result?.tokens?.refreshToken || result?.refreshToken || null;
        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        if (user?.role) localStorage.setItem("role", String(user.role).toLowerCase());
        set({ user, accessToken, refreshToken, isAuthenticated: Boolean(user && accessToken) });
        return user;
      },

      /* ── Logout ── */
      logout: async () => {
        const refreshToken = get().refreshToken;
        try {
          await api.post("/auth/logout", { refreshToken });
        } catch {
          // always clear regardless of server response
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "nihao-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.(true);
      },
      merge: (persistedState, currentState) => {
        const persisted =
          persistedState && typeof persistedState === "object" && "state" in persistedState
            ? persistedState.state || {}
            : persistedState || {};
        const persistedUser = persisted.user || currentState.user;
        const roleFromLegacy = persisted.role || localStorage.getItem("role");
        const mergedUser =
          persistedUser && roleFromLegacy
            ? { ...persistedUser, role: persistedUser.role || roleFromLegacy }
            : persistedUser;
        const accessToken =
          persisted.accessToken ||
          persisted.token ||
          localStorage.getItem("accessToken") ||
          null;
        const refreshToken =
          persisted.refreshToken || localStorage.getItem("refreshToken") || null;

        return {
          ...currentState,
          ...persisted,
          user: mergedUser,
          accessToken,
          refreshToken,
          hydrated: true,
          isAuthenticated:
            persisted.isAuthenticated ??
            Boolean(mergedUser && accessToken),
        };
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        hydrated: state.hydrated,
      }),
    }
  )
);

export default useAuthStore;
