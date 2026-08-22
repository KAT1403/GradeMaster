import type {
  AcademicSystem,
  SemesterSubject,
  SOCH,
  SOR,
  UniSubMode,
} from "../../../shared/types/academic";

export type {
  AcademicSystem,
  SemesterSubject,
  UniSubMode,
} from "../../../shared/types/academic";

export interface AcademicRecordSnapshot {
  selectedSystem: AcademicSystem;
  finalQ1: number | null;
  finalQ2: number | null;
  finalQ3: number | null;
  finalQ4: number | null;
  finalExam: number | null;
  fos: number[];
  sors: SOR[];
  soch: SOCH | null;
  uniSubMode: UniSubMode;
  uniMidterm1: number | null;
  uniMidterm2: number | null;
  uniExam: number | null;
  semesterSubjects: SemesterSubject[];
  semesterGPA?: number;
  semesterGPALetter?: string;
  totalCredits?: number;
  totalPoints?: number;
}

export type AcademicRecordDraft = Omit<
  AcademicRecordSnapshot,
  "semesterGPA" | "semesterGPALetter" | "totalCredits" | "totalPoints"
>;
