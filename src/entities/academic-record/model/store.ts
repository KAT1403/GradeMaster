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
} from "../../../shared/lib/storageMigrations";

export interface SemesterSubject {
  id: string;
  title: string;
  credits: number;
  letter: string;
}

export interface AcademicRecordState {
  activeRecordId: string | null;
  activeRecordTitle: string | null;
  selectedSystem: "bilim_class" | "kundelik" | "final" | "university";
  yearlyGrade: number | null;
  examGrade: number | null;
  fos: number[];
  sors: SOR[];
  soch: SOCH | null;
  uniSubMode: "subject" | "semester";
  uniMidterm1: number | null;
  uniMidterm2: number | null;
  uniExam: number | null;
  semesterSubjects: SemesterSubject[];

  setActiveRecord: (id: string | null, title: string | null) => void;
  setSelectedSystem: (system: "bilim_class" | "kundelik" | "final" | "university") => void;
  setYearlyGrade: (grade: number | null) => void;
  setExamGrade: (grade: number | null) => void;
  addFO: (fo: number) => void;
  removeFO: (index: number) => void;
  setFOS: (fos: number[]) => void;
  setSORS: (sors: SOR[]) => void;
  updateSOR: (id: string, sor: Omit<SOR, "id">) => void;
  setSOCH: (soch: SOCH | null) => void;
  setUniSubMode: (mode: "subject" | "semester") => void;
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
const initialSemesterSubjects = (): SemesterSubject[] => [];

const migrateAcademicRecordState = (
  persistedState: unknown,
): Partial<AcademicRecordState> => {
  if (typeof persistedState !== "object" || persistedState === null) {
    return {};
  }

  const state = persistedState as Partial<AcademicRecordState>;

  const rawSubjects = state.semesterSubjects;
  const validatedSubjects: SemesterSubject[] = Array.isArray(rawSubjects)
    ? rawSubjects.map((item) => {
        const sub = item as unknown as Record<string, unknown>;
        return {
          id: typeof sub.id === "string" ? sub.id : crypto.randomUUID(),
          title: typeof sub.title === "string" ? sub.title : "Предмет",
          credits: typeof sub.credits === "number" ? sub.credits : 3,
          letter: typeof sub.letter === "string" ? sub.letter : "A",
        };
      })
    : initialSemesterSubjects();

  return {
    activeRecordId: normalizeTextOrNull(state.activeRecordId),
    activeRecordTitle: normalizeTextOrNull(state.activeRecordTitle),
    selectedSystem: normalizeSystem(state.selectedSystem),
    yearlyGrade: normalizeGradeValue(state.yearlyGrade),
    examGrade: normalizeGradeValue(state.examGrade),
    fos: normalizeFos(state.fos),
    sors: normalizeSors(state.sors),
    soch: normalizeSoch(state.soch),
    uniSubMode: state.uniSubMode === "semester" ? "semester" : "subject",
    uniMidterm1: normalizeUniGrade(state.uniMidterm1),
    uniMidterm2: normalizeUniGrade(state.uniMidterm2),
    uniExam: normalizeUniGrade(state.uniExam),
    semesterSubjects: validatedSubjects,
  };
};

export const useAcademicRecordStore = create<AcademicRecordState>()(
  persist(
    (set) => ({
      activeRecordId: null as string | null,
      activeRecordTitle: null as string | null,
      selectedSystem: "bilim_class" as "bilim_class" | "kundelik" | "final" | "university",
      yearlyGrade: null as number | null,
      examGrade: null as number | null,
      fos: [] as number[],
      sors: initialSors(),
      soch: null as SOCH | null,
      uniSubMode: "subject" as "subject" | "semester",
      uniMidterm1: null as number | null,
      uniMidterm2: null as number | null,
      uniExam: null as number | null,
      semesterSubjects: initialSemesterSubjects(),

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
          uniSubMode: "subject",
          uniMidterm1: null,
          uniMidterm2: null,
          uniExam: null,
          semesterSubjects: initialSemesterSubjects(),
        }),
    }),
    {
      name: "academic-record-storage-v4",
      version: 4,
      migrate: migrateAcademicRecordState,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...migrateAcademicRecordState(persistedState),
      }),
    },
  ),
);

