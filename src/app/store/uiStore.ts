import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TabType = "calculator" | "predictor" | "analytics";

interface UIState {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: "calculator",
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "ui-storage",
    },
  ),
);
