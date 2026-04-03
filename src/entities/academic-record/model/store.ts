import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SOR {
  id: string;
  score: number;
  max: number;
}

export interface SOCH {
  score: number;
  max: number;
}

export interface AcademicRecordState {
  fos: number[];
  sors: SOR[];
  soch: SOCH | null;
  addFO: (fo: number) => void;
  removeFO: (index: number) => void;
  setFOS: (fos: number[]) => void;
  updateSOR: (id: string, sor: Omit<SOR, "id">) => void;
  setSOCH: (soch: SOCH | null) => void;
  resetAll: () => void;
}

const initialSors = () => Array.from({ length: 4 }, () => ({ id: crypto.randomUUID(), score: 0, max: 0 }));

export const useAcademicRecordStore = create<AcademicRecordState>()(
  persist(
    (set) => ({
      fos: [],
      sors: initialSors(),
      soch: null,

      addFO: (fo) => set((state) => ({ fos: [...state.fos, fo] })),

      removeFO: (index) =>
        set((state) => ({
          fos: state.fos.filter((_, i) => i !== index),
        })),

      setFOS: (newFos) => set({ fos: newFos }),

      updateSOR: (id, newSor) =>
        set((state) => ({
          sors: state.sors.map((sor) =>
            sor.id === id ? { ...sor, ...newSor } : sor,
          ),
        })),

      setSOCH: (soch) => set({ soch }),

      resetAll: () => set({ fos: [], sors: initialSors(), soch: null }),
    }),
    {
      name: "academic-record-storage",
    },
  ),
);
