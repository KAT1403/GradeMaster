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
  | "school"
  | "university"
  | "final"
  | "bilim_class"
  | "kundelik";

export type UniSubMode = "subject" | "semester";
export type SchoolFinalMode = "unweighted";

export interface SemesterSubject {
  id: string;
  title: string;
  credits: number;
  letter: string;
}

export interface SchoolFinalSubject {
  id: string;
  title: string;
  year: 5 | 6 | 7 | 8 | 9 | 10 | 11;
  grade: 2 | 3 | 4 | 5 | null;
}
