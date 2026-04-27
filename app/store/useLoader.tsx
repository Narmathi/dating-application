import { create } from "zustand";

interface LoaderState {
  loading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
}

export const useLoader = create<LoaderState>((set) => ({
  loading: false,
  showLoader: () => set({ loading: true }),
  hideLoader: () => set({ loading: false }),
}));
