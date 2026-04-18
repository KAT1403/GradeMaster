import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SOR, SOCH } from "../../../shared/types/academic";

export interface HistoryEntryData {
  fos: number[];
  sors: SOR[];
  soch: SOCH | null;
}

export interface HistoryEntry {
  id: string;
  title: string;
  lastModified: number;
  data: HistoryEntryData;
  isPinned?: boolean;
  finalPercent: number;
}

export interface HistoryState {
  entries: HistoryEntry[];
  saveEntry: (id: string, title: string, data: HistoryEntryData, finalPercent: number) => void;
  deleteEntry: (id: string) => void;
  togglePin: (id: string) => void;
  clearAll: () => void;
  cleanupExpired: () => void;
}

const EXPIRATION_TIME = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds

export const useHistoryManager = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],

      saveEntry: (id, title, data, finalPercent) =>
        set((state) => {
          const existingEntry = state.entries.find((e) => e.id === id);
          const newEntry: HistoryEntry = {
            id,
            title,
            lastModified: Date.now(),
            data,
            finalPercent,
            isPinned: existingEntry?.isPinned || false,
          };
          const existingIndex = state.entries.findIndex((e) => e.id === id);

          if (existingIndex >= 0) {
            const newEntries = [...state.entries];
            newEntries[existingIndex] = newEntry;
            return { entries: newEntries };
          }
          return { entries: [newEntry, ...state.entries] };
        }),

      togglePin: (id) =>
        set((state) => ({
          entries: state.entries.map((e) => e.id === id ? { ...e, isPinned: !e.isPinned } : e),
        })),

      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),

      clearAll: () => set({ entries: [] }),

      cleanupExpired: () =>
        set((state) => {
          const now = Date.now();
          return {
            entries: state.entries.filter((e) => e.isPinned || now - e.lastModified < EXPIRATION_TIME),
          };
        }),
    }),
    {
      name: "grademaster-history",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.cleanupExpired();
        }
      },
    },
  ),
);
