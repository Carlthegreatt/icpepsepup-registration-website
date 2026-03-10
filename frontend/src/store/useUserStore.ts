import { create } from "zustand";
import { getUserRoleAction } from "@/actions/authActions";

export type UserRole = "admin" | "user" | null;

export interface UserState {
  role: UserRole;
  userId: string | null;
  loading: boolean;
  setRole: (role: UserRole) => void;
  setUserId: (userId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setUser: (role: UserRole, userId: string | null) => void;
  clearUser: () => void;
  initialize: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  role: null,
  userId: null,
  loading: true,
  setRole: (role) => set({ role }),
  setUserId: (userId) => set({ userId }),
  setLoading: (loading) => set({ loading }),
  setUser: (role, userId) => set({ role, userId }),
  clearUser: () => set({ role: null, userId: null }),
  initialize: async () => {
    const currentState = get();
    if (currentState.role !== null) {
      if (currentState.loading) set({ loading: false });
      return;
    }

    try {
      const res = await getUserRoleAction();
      if (!res.success || !res.data) {
        set({ role: null, userId: null, loading: false });
        return;
      }
      const data = res.data;
      set({
        role: data.role === "admin" ? "admin" : data.role === "user" ? "user" : null,
        userId: data.userId ?? null,
        loading: false,
      });
    } catch {
      set({ role: null, userId: null, loading: false });
    }
  },
}));
