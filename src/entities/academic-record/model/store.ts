import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SOR, SOCH } from "../../../shared/types/academic";
import {
  createEmptySor,
  normalizeFos,
  normalizeSors,
  normalizeSoch,
  normalizeTextOrNull,
  normalizeSystem,
  normalizeGradeValue,
  normalizeUniGrade,
  normalizeUniSubMode,
  normalizeSemesterSubjects,
} from "../../../shared/lib/storageMigrations";
import { getRecordPlatform } from "../lib/record";
import type {
  AcademicRecordDraft,
  AcademicRecordSnapshot,
  AcademicSystem,
  SemesterSubject,
  UniSubMode,
} from "./types";

export type { SemesterSubject } from "./types";

export interface AcademicRecordState extends AcademicRecordDraft {
  activeRecordIds: Record<string, string>;

  setActiveRecordId: (id: string) => void;
  clearActiveRecordId: () => void;
  loadSnapshot: (snapshot: AcademicRecordSnapshot, id: string) => void;
  setSelectedSystem: (system: AcademicSystem) => void;
  setFinalQ1: (grade: number | null) => void;
  setFinalQ2: (grade: number | null) => void;
  setFinalQ3: (grade: number | null) => void;
  setFinalQ4: (grade: number | null) => void;
  setFinalExam: (grade: number | null) => void;
  addFO: (fo: number) => void;
  removeFO: (index: number) => void;
  setFOS: (fos: number[]) => void;
  setSORS: (sors: SOR[]) => void;
  updateSOR: (id: string, sor: Omit<SOR, "id">) => void;
  setSOCH: (soch: SOCH | null) => void;
  setUniSubMode: (mode: UniSubMode) => void;
  setUniMidterm1: (val: number | null) => void;
  setUniMidterm2: (val: number | null) => void;
  setUniExam: (val: number | null) => void;
  setSemesterSubjects: (subjects: SemesterSubject[]) => void;
  addSemesterSubject: () => void;
  removeSemesterSubject: (id: string) => void;
  updateSemesterSubject: (
    id: string,
    field: "title" | "credits" | "letter",
    value: string | number,
  ) => void;
  resetAll: () => void;
}

const initialSors = () => Array.from({ length: 4 }, createEmptySor);

const createInitialRecord = (): AcademicRecordDraft & {
  activeRecordIds: Record<string, string>;
} => ({
  activeRecordIds: {},
  selectedSystem: "bilim_class",
  finalQ1: null,
  finalQ2: null,
  finalQ3: null,
  finalQ4: null,
  finalExam: null,
  fos: [],
  sors: initialSors(),
  soch: null,
  uniSubMode: "subject",
  uniMidterm1: null,
  uniMidterm2: null,
  uniExam: null,
  semesterSubjects: [],
});

const normalizeActiveRecordIds = (
  value: unknown,
  fallback: Record<string, string>,
): Record<string, string> => {
  if (typeof value !== "object" || value === null) return fallback;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string" && !!entry[1],
    ),
  );
};

const migrateAcademicRecordState = (
  persistedState: unknown,
): Partial<AcademicRecordState> => {
  if (typeof persistedState !== "object" || persistedState === null) {
    return {};
  }

  const state = persistedState as Record<string, unknown>;

  const draft: AcademicRecordDraft = {
    selectedSystem: normalizeSystem(state.selectedSystem),
    finalQ1: normalizeGradeValue(state.finalQ1 ?? state.yearlyGrade),
    finalQ2: normalizeGradeValue(state.finalQ2 ?? state.yearlyGrade),
    finalQ3: normalizeGradeValue(state.finalQ3 ?? state.yearlyGrade),
    finalQ4: normalizeGradeValue(state.finalQ4 ?? state.yearlyGrade),
    finalExam: normalizeGradeValue(state.finalExam ?? state.examGrade),
    fos: normalizeFos(state.fos),
    sors: normalizeSors(state.sors),
    soch: normalizeSoch(state.soch),
    uniSubMode: normalizeUniSubMode(state.uniSubMode),
    uniMidterm1: normalizeUniGrade(state.uniMidterm1),
    uniMidterm2: normalizeUniGrade(state.uniMidterm2),
    uniExam: normalizeUniGrade(state.uniExam),
    semesterSubjects: normalizeSemesterSubjects(state.semesterSubjects),
  };

  const legacyRecordId = normalizeTextOrNull(state.activeRecordId);

  return {
    ...draft,
    activeRecordIds: normalizeActiveRecordIds(
      state.activeRecordIds,
      legacyRecordId ? { [getRecordPlatform(draft)]: legacyRecordId } : {},
    ),
  };
};

export const useAcademicRecordStore = create<AcademicRecordState>()(
  persist(
    (set) => ({
      ...createInitialRecord(),

      setActiveRecordId: (id) =>
        set((state) => ({
          activeRecordIds: {
            ...state.activeRecordIds,
            [getRecordPlatform(state)]: id,
          },
        })),

      clearActiveRecordId: () =>
        set((state) => {
          const platform = getRecordPlatform(state);
          return {
            activeRecordIds: Object.fromEntries(
              Object.entries(state.activeRecordIds).filter(
                ([key]) => key !== platform,
              ),
            ),
          };
        }),

      loadSnapshot: (snapshot, id) =>
        set((state) => ({
          activeRecordIds: {
            ...state.activeRecordIds,
            [getRecordPlatform(snapshot)]: id,
          },
          selectedSystem: snapshot.selectedSystem,
          finalQ1: snapshot.finalQ1,
          finalQ2: snapshot.finalQ2,
          finalQ3: snapshot.finalQ3,
          finalQ4: snapshot.finalQ4,
          finalExam: snapshot.finalExam,
          fos: [...snapshot.fos],
          sors: normalizeSors(snapshot.sors),
          soch: snapshot.soch ? { ...snapshot.soch } : null,
          uniSubMode: snapshot.uniSubMode,
          uniMidterm1: snapshot.uniMidterm1,
          uniMidterm2: snapshot.uniMidterm2,
          uniExam: snapshot.uniExam,
          semesterSubjects: snapshot.semesterSubjects.map((sub) => ({ ...sub })),
        })),

      setSelectedSystem: (selectedSystem) => set({ selectedSystem }),
      setFinalQ1: (finalQ1) => set({ finalQ1 }),
      setFinalQ2: (finalQ2) => set({ finalQ2 }),
      setFinalQ3: (finalQ3) => set({ finalQ3 }),
      setFinalQ4: (finalQ4) => set({ finalQ4 }),
      setFinalExam: (finalExam) => set({ finalExam }),

      addFO: (fo) =>
        set((state) => {
          if (state.fos.length >= 50) return state;
          return { fos: [...state.fos, fo] };
        }),

      removeFO: (index) =>
        set((state) => ({
          fos: state.fos.filter((_, i) => i !== index),
        })),

      setFOS: (newFos) => set({ fos: newFos }),

      setSORS: (newSors) => set({ sors: newSors }),

      updateSOR: (id, newSor) =>
        set((state) => ({
          sors: state.sors.map((sor) =>
            sor.id === id ? { ...sor, ...newSor } : sor,
          ),
        })),

      setSOCH: (soch) => set({ soch }),

      setUniSubMode: (uniSubMode) => set({ uniSubMode }),
      setUniMidterm1: (uniMidterm1) => set({ uniMidterm1 }),
      setUniMidterm2: (uniMidterm2) => set({ uniMidterm2 }),
      setUniExam: (uniExam) => set({ uniExam }),
      setSemesterSubjects: (semesterSubjects) => set({ semesterSubjects }),

      addSemesterSubject: () =>
        set((state) => ({
          semesterSubjects: [
            ...state.semesterSubjects,
            { id: crypto.randomUUID(), title: "", credits: 3, letter: "A" },
          ],
        })),

      removeSemesterSubject: (id) =>
        set((state) => ({
          semesterSubjects: state.semesterSubjects.filter((sub) => sub.id !== id),
        })),

      updateSemesterSubject: (id, field, value) =>
        set((state) => ({
          semesterSubjects: state.semesterSubjects.map((sub) =>
            sub.id === id ? { ...sub, [field]: value } : sub,
          ),
        })),

      resetAll: () => set(createInitialRecord()),
    }),
    {
      name: "academic-record-storage-v4",
      version: 5,
      migrate: migrateAcademicRecordState,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...migrateAcademicRecordState(persistedState),
      }),
    },
  ),
);
