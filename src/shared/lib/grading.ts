import type { AcademicSystem } from "../types/academic";
import { ECTS_VALUES, getLetterFromGPA } from "./converters";

export interface CalculateParams {
  fos: number[];
  sors: { score: number | null; max: number | null }[];
  soch: { score: number | null; max: number | null } | null;
  weights?: { fo: number; sor: number; soch: number };
  uniMidterm1?: number | null;
  uniMidterm2?: number | null;
  uniExam?: number | null;
}

export interface SemesterSubjectLike {
  credits: number;
  letter: string;
}

export interface SemesterSummary {
  totalPoints: number;
  totalCredits: number;
  semesterGPA: number;
  semesterGPALetter: string;
}

export interface FinalSystemParams {
  finalQ1: number | null;
  finalQ2: number | null;
  finalQ3: number | null;
  finalQ4: number | null;
  finalExam: number | null;
}

export interface FinalSystemScore {
  score: number;
  filledQuarters: number;
}

export const FINAL_SCORE_TO_PERCENT = 20;

export const ADMISSION_THRESHOLD = 50;

export const isScoreOverMax = (
  score: number | null,
  max: number | null,
): boolean => score !== null && max !== null && max > 0 && score > max;

export const isCompleteScore = (
  score: number | null,
  max: number | null,
): boolean =>
  score !== null && max !== null && max > 0 && !isScoreOverMax(score, max);

export const getGradeFromPercent = (percent: number): 2 | 3 | 4 | 5 => {
  const rounded = Math.round(percent);
  if (rounded >= 85) return 5;
  if (rounded >= 65) return 4;
  if (rounded >= 40) return 3;
  return 2;
};

export const getNextGradeInfo = (percent: number) => {
  const rounded = Math.round(percent);
  if (rounded >= 85) return { nextGrade: null, remaining: 0, target: 100 };
  if (rounded >= 65)
    return { nextGrade: 5, remaining: 84.5 - percent, target: 84.5 };
  if (rounded >= 40)
    return { nextGrade: 4, remaining: 64.5 - percent, target: 64.5 };
  return { nextGrade: 3, remaining: 39.5 - percent, target: 39.5 };
};

export const calculateAdmissionRating = (
  midterm1: number | null,
  midterm2: number | null,
): number => {
  const filled = [midterm1, midterm2].filter((v): v is number => v !== null);
  if (filled.length === 0) return 0;
  return filled.reduce((sum, val) => sum + val, 0) / filled.length;
};

export const isExamAllowed = (admissionRating: number): boolean =>
  admissionRating >= ADMISSION_THRESHOLD;

export const calculateFinalScore = (
  params: FinalSystemParams,
): FinalSystemScore => {
  const quarters = [
    params.finalQ1,
    params.finalQ2,
    params.finalQ3,
    params.finalQ4,
  ].filter((q): q is number => q !== null);

  if (quarters.length === 0) return { score: 0, filledQuarters: 0 };

  const avgQuarters =
    quarters.reduce((sum, val) => sum + val, 0) / quarters.length;
  const score =
    params.finalExam !== null
      ? avgQuarters * 0.7 + params.finalExam * 0.3
      : avgQuarters;

  return { score, filledQuarters: quarters.length };
};

export const calculateTotalPercent = (
  params: CalculateParams,
  system: AcademicSystem = "bilim_class",
): number => {
  if (system === "final") return 0;

  if (system === "university") {
    const m1 = params.uniMidterm1 ?? null;
    const m2 = params.uniMidterm2 ?? null;
    const exam = params.uniExam ?? null;

    if (m1 === null && m2 === null && exam === null) return 0;

    const admissionRating = calculateAdmissionRating(m1, m2);

    if (!isExamAllowed(admissionRating)) {
      return admissionRating * 0.6;
    }

    if (exam === null) {
      return admissionRating;
    }

    return admissionRating * 0.6 + exam * 0.4;
  }

  const { fos, sors, soch } = params;

  const hasFO = fos.length > 0;
  const validSors = sors.filter((s) => isCompleteScore(s.score, s.max));
  const hasSOR = validSors.length > 0;
  const hasSOCH = soch !== null && isCompleteScore(soch.score, soch.max);

  if (!hasFO && !hasSOR && !hasSOCH) return 0;

  const foRatio = hasFO ? fos.reduce((sum, val) => sum + val, 0) / (fos.length * 10) : null;
  
  let sorRatio: number | null = null;
  if (hasSOR) {
    const totalSorScore = validSors.reduce((sum, s) => sum + (s.score ?? 0), 0);
    const totalSorMax = validSors.reduce((sum, s) => sum + (s.max ?? 0), 0);
    sorRatio = totalSorScore / totalSorMax;
  }

  const sochRatio = hasSOCH ? soch.score! / soch.max! : null;

  if (system === "kundelik") {
    const foPct = foRatio !== null ? Math.round(foRatio * 1000) / 10 : null;
    const sorPct = sorRatio !== null ? Math.round(sorRatio * 1000) / 10 : null;
    const sochPct = sochRatio !== null ? Math.round(sochRatio * 1000) / 10 : null;

    if (foPct !== null && sorPct === null && sochPct === null) return foPct;
    if (sorPct !== null && foPct === null && sochPct === null) return sorPct;
    if (sochPct !== null && foPct === null && sorPct === null) return sochPct;

    if (foPct !== null && sorPct !== null && sochPct === null) {
      return Math.round((foPct * 0.5 + sorPct * 0.5) * 10) / 10;
    }
    if (foPct !== null && sorPct === null && sochPct !== null) {
      return Math.round(((foPct * 25 + sochPct * 50) / 75) * 10) / 10;
    }
    if (sorPct !== null && foPct === null && sochPct !== null) {
      return Math.round(((sorPct * 25 + sochPct * 50) / 75) * 10) / 10;
    }
    return Math.round((foPct! * 0.25 + sorPct! * 0.25 + sochPct! * 0.5) * 10) / 10;
  } else {
    if (foRatio !== null && sorRatio === null && sochRatio === null) {
      const pct = foRatio * 100;
      return system === "bilim_class" ? Math.round(pct) : Math.round(pct * 10) / 10;
    }
    if (sorRatio !== null && foRatio === null && sochRatio === null) {
      const pct = sorRatio * 100;
      return system === "bilim_class" ? Math.round(pct) : Math.round(pct * 10) / 10;
    }
    if (sochRatio !== null && foRatio === null && sorRatio === null) {
      const pct = sochRatio * 100;
      return system === "bilim_class" ? Math.round(pct) : Math.round(pct * 10) / 10;
    }

    if (foRatio !== null && sorRatio !== null && sochRatio === null) {
      const pct = foRatio * 50 + sorRatio * 50;
      return system === "bilim_class" ? Math.round(pct) : Math.round(pct * 10) / 10;
    }
    if (foRatio !== null && sorRatio === null && sochRatio !== null) {
      const pct = (foRatio * 25 + sochRatio * 50) / 0.75;
      return system === "bilim_class" ? Math.round(pct) : Math.round(pct * 10) / 10;
    }
    if (sorRatio !== null && foRatio === null && sochRatio !== null) {
      const pct = (sorRatio * 25 + sochRatio * 50) / 0.75;
      return system === "bilim_class" ? Math.round(pct) : Math.round(pct * 10) / 10;
    }
    const pct = foRatio! * 25 + sorRatio! * 25 + sochRatio! * 50;
    return system === "bilim_class" ? Math.round(pct) : Math.round(pct * 10) / 10;
  }
};

export const GPA_MAX = 4;

export const gpaToPercentEquivalent = (gpa: number): number =>
  Math.max(0, Math.min(100, (gpa / GPA_MAX) * 100));

export const calculateSemesterSummary = (
  subjects: SemesterSubjectLike[],
): SemesterSummary => {
  const totalPoints = subjects.reduce(
    (sum, sub) => sum + (ECTS_VALUES[sub.letter] || 0) * sub.credits,
    0,
  );
  const totalCredits = subjects.reduce((sum, sub) => sum + sub.credits, 0);
  const semesterGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return {
    totalPoints,
    totalCredits,
    semesterGPA,
    semesterGPALetter: totalCredits > 0 ? getLetterFromGPA(semesterGPA) : "-",
  };
};

export const getGradeColors = (grade: number) => {
  switch (grade) {
    case 5:
    case 4:
      return {
        bg: "#3b8f21",
        text: "#ffffff",
        border: "#3b8f21",
        solid: "#3b8f21",
      };
    case 3:
      return {
        bg: "#ff8e12",
        text: "#ffffff",
        border: "#ff8e12",
        solid: "#ff8e12",
      };
    case 2:
      return {
        bg: "#d13142",
        text: "#ffffff",
        border: "#d13142",
        solid: "#d13142",
      };
    default:
      return {
        bg: "#f8fafc",
        text: "#334155",
        border: "#e2e8f0",
        solid: "#cbd5e1",
      };
  }
};

const UNI_HIGH_LETTERS = ["A", "A-", "B+", "B", "B-"];
const UNI_MID_LETTERS = ["C+", "C", "C-", "D+", "D"];

export const getUniGradeColors = (letter: string) => {
  if (UNI_HIGH_LETTERS.includes(letter)) return getGradeColors(5);
  if (UNI_MID_LETTERS.includes(letter)) return getGradeColors(3);
  return getGradeColors(2);
};

export const getFoColor = (num: number) => {
  if (num >= 8) return getGradeColors(5);
  if (num >= 5) return getGradeColors(3);
  return getGradeColors(2);
};

export const getScoreColor = (score: number | null, max: number | null) => {
  if (!isCompleteScore(score, max)) return getGradeColors(0);
  const percent = (score! / max!) * 100;
  return getGradeColors(getGradeFromPercent(percent));
};
