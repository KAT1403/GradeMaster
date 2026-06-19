export interface CalculateParams {
  fos: number[];
  sors: { score: number | null; max: number | null }[];
  soch: { score: number | null; max: number | null } | null;
  weights?: { fo: number; sor: number; soch: number };
  uniMidterm1?: number | null;
  uniMidterm2?: number | null;
  uniExam?: number | null;
}

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

export const calculateTotalPercent = (
  params: CalculateParams,
  system: "bilim_class" | "kundelik" | "university" | "final" = "bilim_class",
): number => {
  if (system === "final") return 0;

  if (system === "university") {
    const m1 = params.uniMidterm1;
    const m2 = params.uniMidterm2;
    const exam = params.uniExam;

    if (m1 === null && m2 === null && (exam === null || exam === undefined)) return 0;

    const admissionRating = (m1 !== null || m2 !== null)
      ? ((m1 ?? 0) + (m2 ?? 0)) / ((m1 !== null ? 1 : 0) + (m2 !== null ? 1 : 0))
      : 0;

    if (admissionRating < 50) {
      return admissionRating * 0.6;
    }

    if (exam === null || exam === undefined) {
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
    const foPct = foRatio !== null ? Math.round(foRatio * 10000) / 100 : null;
    const sorPct = sorRatio !== null ? Math.round(sorRatio * 10000) / 100 : null;
    const sochPct = sochRatio !== null ? Math.round(sochRatio * 10000) / 100 : null;

    if (foPct !== null && sorPct === null && sochPct === null) return foPct;
    if (sorPct !== null && foPct === null && sochPct === null) return sorPct;
    if (sochPct !== null && foPct === null && sorPct === null) return sochPct;

    if (foPct !== null && sorPct !== null && sochPct === null) {
      return Math.round((foPct * 0.5 + sorPct * 0.5) * 100) / 100;
    }
    if (foPct !== null && sorPct === null && sochPct !== null) {
      return Math.round(((foPct * 25 + sochPct * 50) / 75) * 100) / 100;
    }
    if (sorPct !== null && foPct === null && sochPct !== null) {
      return Math.round(((sorPct * 25 + sochPct * 50) / 75) * 100) / 100;
    }
    return Math.round((foPct! * 0.25 + sorPct! * 0.25 + sochPct! * 0.5) * 100) / 100;
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
