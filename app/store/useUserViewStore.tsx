import { create } from "zustand";

export type UserView = "list" | "userForm" | "profile";

interface UserViewState {
  currentView: UserView;
  selectedUserId: string | null;

  setView: (view: UserView) => void;
  setSelectedUser: (id: string | null) => void;
  reset: () => void;
}

export const useUserViewStore = create<UserViewState>((set) => ({
  currentView: "list",
  selectedUserId: null,

  setView: (view) => set({ currentView: view }),
  setSelectedUser: (id) => set({ selectedUserId: id }),

  reset: () =>
    set({
      currentView: "list",
      selectedUserId: null,
    }),
}));
