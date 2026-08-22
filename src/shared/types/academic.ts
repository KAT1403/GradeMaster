export interface SOR {
  id: string;
  score: number | null;
  max: number | null;
}

export interface SOCH {
  score: number | null;
  max: number | null;
}

export type AcademicSystem =
  | "bilim_class"
  | "kundelik"
  | "final"
  | "university";

export type UniSubMode = "subject" | "semester";

export interface SemesterSubject {
  id: string;
  title: string;
  credits: number;
  letter: string;
}
