import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TabType = "calculator" | "predictor" | "analytics" | "info";
export type ThemeType = "light" | "dark";

interface UIState {
  activeTab: TabType;
  theme: ThemeType;
  setActiveTab: (tab: TabType) => void;
  toggleTheme: () => void;
}

const tabs: TabType[] = ["calculator", "predictor", "analytics", "info"];
const themes: ThemeType[] = ["light", "dark"];

const migrateUIState = (persistedState: unknown): Partial<UIState> => {
  if (typeof persistedState !== "object" || persistedState === null) {
    return {};
  }

  const state = persistedState as Partial<UIState>;

  return {
    activeTab: tabs.includes(state.activeTab as TabType)
      ? state.activeTab
      : "calculator",
    theme: themes.includes(state.theme as ThemeType) ? state.theme : "light",
  };
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: "calculator",
      theme: "light",
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
    }),
    {
      name: "ui-storage",
      version: 1,
      migrate: migrateUIState,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...migrateUIState(persistedState),
      }),
    },
  ),
);
