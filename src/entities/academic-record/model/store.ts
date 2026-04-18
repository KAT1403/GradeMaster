import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SOR, SOCH } from "../../../shared/types/academic";

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

const initialSors = () => Array.from({ length: 4 }, () => ({ id: crypto.randomUUID(), score: 0, max: 0 }));

export const useAcademicRecordStore = create<AcademicRecordState>()(
  persist(
    (set) => ({
      activeRecordId: null,
      activeRecordTitle: null,
      fos: [],
      sors: initialSors(),
      soch: null,

      setActiveRecord: (id, title) => set({ activeRecordId: id, activeRecordTitle: title }),

      addFO: (fo) => set((state) => ({ fos: [...state.fos, fo] })),

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

      resetAll: () => set({ activeRecordId: null, activeRecordTitle: null, fos: [], sors: initialSors(), soch: null }),
    }),
    {
      name: "academic-record-storage",
    },
  ),
);
