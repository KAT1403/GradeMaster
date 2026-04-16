import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TabType = "calculator" | "predictor" | "analytics";
export type ThemeType = "light" | "dark";

interface UIState {
  activeTab: TabType;
  theme: ThemeType;
  setActiveTab: (tab: TabType) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: "calculator",
      theme: "light",
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
    }),
    {
      name: "ui-storage",
    },
  ),
);
