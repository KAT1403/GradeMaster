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
  addSOR: (sor: Omit<SOR, "id">) => void;
  updateSOR: (id: string, sor: Omit<SOR, "id">) => void;
  removeSOR: (id: string) => void;
  setSOCH: (soch: SOCH | null) => void;
  resetAll: () => void;
}

export const useAcademicRecordStore = create<AcademicRecordState>()(
  persist(
    (set) => ({
      fos: [],
      sors: [],
      soch: null,

      addFO: (fo) => set((state) => ({ fos: [...state.fos, fo] })),

      removeFO: (index) =>
        set((state) => ({
          fos: state.fos.filter((_, i) => i !== index),
        })),

      addSOR: (sor) =>
        set((state) => ({
          sors: [...state.sors, { ...sor, id: crypto.randomUUID() }],
        })),

      updateSOR: (id, newSor) =>
        set((state) => ({
          sors: state.sors.map((sor) =>
            sor.id === id ? { ...sor, ...newSor } : sor,
          ),
        })),

      removeSOR: (id) =>
        set((state) => ({
          sors: state.sors.filter((sor) => sor.id !== id),
        })),

      setSOCH: (soch) => set({ soch }),

      resetAll: () => set({ fos: [], sors: [], soch: null }),
    }),
    {
      name: "academic-record-storage",
    },
  ),
);
