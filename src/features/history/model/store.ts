import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SOR, SOCH } from "../../../shared/types/academic";
import {
  normalizeFos,
  normalizeSors,
  normalizeSoch,
  normalizeTimestamp,
  normalizeSystem,
  normalizeGradeValue,
} from "../../../shared/lib/storageMigrations";

export interface HistoryEntryData {
  selectedSystem?: "bilim_class" | "kundelik" | "final" | "gpa";
  yearlyGrade?: number | null;
  examGrade?: number | null;
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

const EXPIRATION_TIME = 90 * 24 * 60 * 60 * 1000; 

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeHistoryEntry = (value: unknown): HistoryEntry | null => {
  if (!isRecord(value) || !isRecord(value.data)) return null;

  const id =
    typeof value.id === "string" && value.id ? value.id : crypto.randomUUID();
  const title =
    typeof value.title === "string" && value.title ? value.title : "Untitled";
  const finalPercent =
    typeof value.finalPercent === "number" && Number.isFinite(value.finalPercent)
      ? value.finalPercent
      : 0;

  return {
    id,
    title,
    lastModified: normalizeTimestamp(value.lastModified),
    data: {
      selectedSystem: normalizeSystem(value.data.selectedSystem),
      yearlyGrade: normalizeGradeValue(value.data.yearlyGrade),
      examGrade: normalizeGradeValue(value.data.examGrade),
      fos: normalizeFos(value.data.fos),
      sors: normalizeSors(value.data.sors),
      soch: normalizeSoch(value.data.soch),
    },
    isPinned: value.isPinned === true,
    finalPercent,
  };
};

const migrateHistoryState = (persistedState: unknown): Partial<HistoryState> => {
  if (!isRecord(persistedState) || !Array.isArray(persistedState.entries)) {
    return {};
  }

  const now = Date.now();
  const entries = persistedState.entries
    .map(normalizeHistoryEntry)
    .filter((entry): entry is HistoryEntry => entry !== null)
    .filter((entry) => entry.isPinned || now - entry.lastModified < EXPIRATION_TIME);

  return { entries };
};

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
      version: 2,
      migrate: migrateHistoryState,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...migrateHistoryState(persistedState),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.cleanupExpired();
        }
      },
    },
  ),
);
