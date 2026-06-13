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
} from "../../../shared/lib/storageMigrations";

export interface AcademicRecordState {
  activeRecordId: string | null;
  activeRecordTitle: string | null;
  selectedSystem: "bilim_class" | "kundelik" | "final" | "gpa";
  yearlyGrade: number | null;
  examGrade: number | null;
  fos: number[];
  sors: SOR[];
  soch: SOCH | null;
  setActiveRecord: (id: string | null, title: string | null) => void;
  setSelectedSystem: (system: "bilim_class" | "kundelik" | "final" | "gpa") => void;
  setYearlyGrade: (grade: number | null) => void;
  setExamGrade: (grade: number | null) => void;
  addFO: (fo: number) => void;
  removeFO: (index: number) => void;
  setFOS: (fos: number[]) => void;
  setSORS: (sors: SOR[]) => void;
  updateSOR: (id: string, sor: Omit<SOR, "id">) => void;
  setSOCH: (soch: SOCH | null) => void;
  resetAll: () => void;
}

const initialSors = () => Array.from({ length: 4 }, createEmptySor);

const migrateAcademicRecordState = (
  persistedState: unknown,
): Partial<AcademicRecordState> => {
  if (typeof persistedState !== "object" || persistedState === null) {
    return {};
  }

  const state = persistedState as Partial<AcademicRecordState>;

  return {
    activeRecordId: normalizeTextOrNull(state.activeRecordId),
    activeRecordTitle: normalizeTextOrNull(state.activeRecordTitle),
    selectedSystem: normalizeSystem(state.selectedSystem),
    yearlyGrade: normalizeGradeValue(state.yearlyGrade),
    examGrade: normalizeGradeValue(state.examGrade),
    fos: normalizeFos(state.fos),
    sors: normalizeSors(state.sors),
    soch: normalizeSoch(state.soch),
  };
};

export const useAcademicRecordStore = create<AcademicRecordState>()(
  persist(
    (set) => ({
      activeRecordId: null as string | null,
      activeRecordTitle: null as string | null,
      selectedSystem: "bilim_class" as "bilim_class" | "kundelik" | "final" | "gpa",
      yearlyGrade: null as number | null,
      examGrade: null as number | null,
      fos: [] as number[],
      sors: initialSors(),
      soch: null as SOCH | null,

      setActiveRecord: (id, title) =>
          set({ activeRecordId: id, activeRecordTitle: title }),

      setSelectedSystem: (selectedSystem) => set({ selectedSystem }),
      setYearlyGrade: (yearlyGrade) => set({ yearlyGrade }),
      setExamGrade: (examGrade) => set({ examGrade }),

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

      resetAll: () =>
        set({
          activeRecordId: null,
          activeRecordTitle: null,
          selectedSystem: "bilim_class",
          yearlyGrade: null,
          examGrade: null,
          fos: [],
          sors: initialSors(),
          soch: null,
        }),
    }),
    {
      name: "academic-record-storage-v3", // upgraded version storage key to prevent collision
      version: 3,
      migrate: migrateAcademicRecordState,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...migrateAcademicRecordState(persistedState),
      }),
    },
  ),
);
