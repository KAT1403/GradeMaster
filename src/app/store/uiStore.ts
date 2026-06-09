import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TabType = "workspace" | "subjects" | "profile" | "settings";
export type ThemeType = "light" | "dark";

interface UIState {
  activeTab: TabType;
  theme: ThemeType;
  setActiveTab: (tab: TabType) => void;
  toggleTheme: () => void;
}

const tabs: TabType[] = ["workspace", "subjects", "profile", "settings"];
const themes: ThemeType[] = ["light", "dark"];

const migrateUIState = (persistedState: unknown): Partial<UIState> => {
  if (typeof persistedState !== "object" || persistedState === null) {
    return {};
  }

  const state = persistedState as Partial<UIState>;

  return {
    activeTab: tabs.includes(state.activeTab as TabType)
      ? state.activeTab
      : "workspace",
    theme: themes.includes(state.theme as ThemeType) ? state.theme : "dark",
  };
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: "workspace",
      theme: "dark",
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
    }),
    {
      name: "ui-storage",
      version: 2,
      migrate: migrateUIState,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...migrateUIState(persistedState),
      }),
    },
  ),
);
