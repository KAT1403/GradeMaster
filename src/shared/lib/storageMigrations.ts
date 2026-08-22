import type {
  AcademicSystem,
  SemesterSubject,
  SOCH,
  SOR,
  UniSubMode,
} from "../types/academic";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNumberOrNull = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const normalizeScorePair = (
  scoreValue: unknown,
  maxValue: unknown,
): { score: number | null; max: number | null } => {
  const score = toNumberOrNull(scoreValue);
  const max = toNumberOrNull(maxValue);

  if (score === 0 && max === 0) {
    return { score: null, max: null };
  }

  return {
    score,
    max: max !== null && max > 0 ? max : null,
  };
};

export const createEmptySor = (): SOR => ({
  id: crypto.randomUUID(),
  score: null,
  max: null,
});

export const normalizeFos = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is number => Number.isInteger(item))
    .filter((item) => item >= 1 && item <= 10)
    .slice(0, 50);
};

export const normalizeSor = (value: unknown): SOR => {
  if (!isRecord(value)) return createEmptySor();
  const { score, max } = normalizeScorePair(value.score, value.max);

  return {
    id:
      typeof value.id === "string" && value.id ? value.id : crypto.randomUUID(),
    score,
    max,
  };
};

export const normalizeSors = (value: unknown): SOR[] => {
  const source = Array.isArray(value) ? value : [];
  const normalized = source.slice(0, 4).map(normalizeSor);

  while (normalized.length < 4) {
    normalized.push(createEmptySor());
  }

  return normalized;
};

export const normalizeSoch = (value: unknown): SOCH | null => {
  if (!isRecord(value)) return null;
  return normalizeScorePair(value.score, value.max);
};

export const normalizeTextOrNull = (value: unknown): string | null =>
  typeof value === "string" && value ? value : null;

export const normalizeTimestamp = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : Date.now();

export const normalizeSystem = (value: unknown): AcademicSystem => {
  if (
    value === "bilim_class" ||
    value === "kundelik" ||
    value === "final" ||
    value === "university"
  ) {
    return value;
  }
  if (value === "gpa") {
    return "university";
  }
  if (value === "25/25/50") {
    return "bilim_class";
  }
  return "bilim_class";
};

export const normalizeGradeValue = (value: unknown): number | null => {
  const num = toNumberOrNull(value);
  if (num === null) return null;
  return num >= 2 && num <= 5 ? num : null;
};

export const normalizeUniGrade = (value: unknown): number | null => {
  const num = toNumberOrNull(value);
  if (num === null) return null;
  return num >= 0 && num <= 100 ? num : null;
};


export const normalizeUniSubMode = (value: unknown): UniSubMode =>
  value === "semester" ? "semester" : "subject";

export const normalizeSemesterSubject = (value: unknown): SemesterSubject => {
  const item = isRecord(value) ? value : {};
  const credits = toNumberOrNull(item.credits);

  return {
    id: typeof item.id === "string" && item.id ? item.id : crypto.randomUUID(),
    title: typeof item.title === "string" ? item.title : "",
    credits: credits !== null ? Math.min(30, Math.max(0, credits)) : 3,
    letter: typeof item.letter === "string" ? item.letter : "A",
  };
};

export const normalizeSemesterSubjects = (value: unknown): SemesterSubject[] =>
  Array.isArray(value) ? value.map(normalizeSemesterSubject) : [];
