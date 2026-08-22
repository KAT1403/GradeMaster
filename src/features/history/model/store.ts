import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AcademicRecordSnapshot } from "../../../entities/academic-record/model/types";
import {
  normalizeFos,
  normalizeSors,
  normalizeSoch,
  normalizeTimestamp,
  normalizeSystem,
  normalizeGradeValue,
  normalizeUniGrade,
  normalizeUniSubMode,
  normalizeSemesterSubjects,
} from "../../../shared/lib/storageMigrations";

export type HistoryEntryData = AcademicRecordSnapshot;

export interface HistoryEntry {
  id: string;
  title: string;
  lastModified: number;
  data: HistoryEntryData;
  isPinned?: boolean;
}

export interface HistoryState {
  entries: HistoryEntry[];
  saveEntry: (id: string, title: string, data: HistoryEntryData) => void;
  deleteEntry: (id: string) => void;
  togglePin: (id: string) => void;
  clearAll: () => void;
  cleanupExpired: () => void;
}

const EXPIRATION_TIME = 90 * 24 * 60 * 60 * 1000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeSnapshot = (
  data: Record<string, unknown>,
): AcademicRecordSnapshot => {
  const semesterSubjects = normalizeSemesterSubjects(data.semesterSubjects);
  const uniMidterm1 = normalizeUniGrade(data.uniMidterm1);
  const uniMidterm2 = normalizeUniGrade(data.uniMidterm2);
  const uniExam = normalizeUniGrade(data.uniExam);

  const hasLegacySemesterData =
    semesterSubjects.length > 0 &&
    uniMidterm1 === null &&
    uniMidterm2 === null &&
    uniExam === null;

  const uniSubMode =
    data.uniSubMode === undefined && hasLegacySemesterData
      ? "semester"
      : normalizeUniSubMode(data.uniSubMode);

  return {
    selectedSystem: normalizeSystem(data.selectedSystem),
    finalQ1: normalizeGradeValue(data.finalQ1 ?? data.yearlyGrade),
    finalQ2: normalizeGradeValue(data.finalQ2 ?? data.yearlyGrade),
    finalQ3: normalizeGradeValue(data.finalQ3 ?? data.yearlyGrade),
    finalQ4: normalizeGradeValue(data.finalQ4 ?? data.yearlyGrade),
    finalExam: normalizeGradeValue(data.finalExam ?? data.examGrade),
    fos: normalizeFos(data.fos),
    sors: normalizeSors(data.sors),
    soch: normalizeSoch(data.soch),
    uniSubMode,
    uniMidterm1,
    uniMidterm2,
    uniExam,
    semesterSubjects,
    semesterGPA:
      typeof data.semesterGPA === "number" ? data.semesterGPA : undefined,
    semesterGPALetter:
      typeof data.semesterGPALetter === "string"
        ? data.semesterGPALetter
        : undefined,
    totalCredits:
      typeof data.totalCredits === "number" ? data.totalCredits : undefined,
    totalPoints:
      typeof data.totalPoints === "number" ? data.totalPoints : undefined,
  };
};

const normalizeHistoryEntry = (value: unknown): HistoryEntry | null => {
  if (!isRecord(value) || !isRecord(value.data)) return null;

  return {
    id: typeof value.id === "string" && value.id ? value.id : crypto.randomUUID(),
    title:
      typeof value.title === "string" && value.title ? value.title : "Untitled",
    lastModified: normalizeTimestamp(value.lastModified),
    data: normalizeSnapshot(value.data),
    isPinned: value.isPinned === true,
  };
};

const isAlive = (entry: HistoryEntry, now: number): boolean =>
  entry.isPinned === true || now - entry.lastModified < EXPIRATION_TIME;

const migrateHistoryState = (persistedState: unknown): Partial<HistoryState> => {
  if (!isRecord(persistedState) || !Array.isArray(persistedState.entries)) {
    return {};
  }

  const now = Date.now();
  const entries = persistedState.entries
    .map(normalizeHistoryEntry)
    .filter((entry): entry is HistoryEntry => entry !== null)
    .filter((entry) => isAlive(entry, now));

  return { entries };
};

export const useHistoryManager = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],

      saveEntry: (id, title, data) =>
        set((state) => {
          const existingEntry = state.entries.find((e) => e.id === id);
          const newEntry: HistoryEntry = {
            id,
            title,
            lastModified: Date.now(),
            data,
            isPinned: existingEntry?.isPinned || false,
          };

          return {
            entries: existingEntry
              ? state.entries.map((e) => (e.id === id ? newEntry : e))
              : [newEntry, ...state.entries],
          };
        }),

      togglePin: (id) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, isPinned: !e.isPinned } : e,
          ),
        })),

      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),

      clearAll: () => set({ entries: [] }),

      cleanupExpired: () =>
        set((state) => {
          const now = Date.now();
          return { entries: state.entries.filter((e) => isAlive(e, now)) };
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
