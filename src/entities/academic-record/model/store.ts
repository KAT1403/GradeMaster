import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SOR, SOCH } from "../../../shared/types/academic";
import {
  createEmptySor,
  normalizeFos,
  normalizeSors,
  normalizeSoch,
  normalizeTextOrNull,
} from "../../../shared/lib/storageMigrations";

export interface AcademicRecordState {
  activeRecordId: string | null;
  activeRecordTitle: string | null;
  fos: number[];
  sors: SOR[];
  soch: SOCH | null;
  setActiveRecord: (id: string | null, title: string | null) => void;
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
      fos: [] as number[],
      sors: initialSors(),
      soch: null as SOCH | null,

      setActiveRecord: (id, title) =>
        set({ activeRecordId: id, activeRecordTitle: title }),

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
          fos: [],
          sors: initialSors(),
          soch: null,
        }),
    }),
    {
      name: "academic-record-storage",
      version: 2,
      migrate: migrateAcademicRecordState,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...migrateAcademicRecordState(persistedState),
      }),
    },
  ),
);
