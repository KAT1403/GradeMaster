export interface CalculateParams {
  fos: number[];
  sors: { score: number; max: number }[];
  soch: { score: number; max: number } | null;
  weights?: { fo: number; sor: number; soch: number };
}

export const getGradeFromPercent = (percent: number): 2 | 3 | 4 | 5 => {
  if (percent >= 85) return 5;
  if (percent >= 65) return 4;
  if (percent >= 40) return 3;
  return 2;
};

export const getNextGradeInfo = (percent: number) => {
  if (percent >= 85) return { nextGrade: null, remaining: 0, target: 100 };
  if (percent >= 65) return { nextGrade: 5, remaining: 85 - percent, target: 85 };
  if (percent >= 40) return { nextGrade: 4, remaining: 65 - percent, target: 65 };
  return { nextGrade: 3, remaining: 40 - percent, target: 40 };
};

export const calculateTotalPercent = ({ 
  fos, 
  sors, 
  soch, 
  weights = { fo: 0.25, sor: 0.25, soch: 0.50 } 
}: CalculateParams): number => {
  let total = 0;
  let activeWeightsTotal = 0;

  if (fos.length > 0) {
    const avgFO = fos.reduce((sum, val) => sum + val, 0) / fos.length;
    total += (avgFO / 10) * weights.fo * 100;
    activeWeightsTotal += weights.fo;
  }

  if (sors.length > 0) {
    const validSors = sors.filter((s) => s.max > 0);
    if (validSors.length > 0) {
      const avgSorPercent = validSors.reduce((sum, s) => sum + (s.score / s.max), 0) / validSors.length;
      total += avgSorPercent * weights.sor * 100;
      activeWeightsTotal += weights.sor;
    }
  }

  if (soch && soch.max > 0) {
    total += (soch.score / soch.max) * weights.soch * 100;
    activeWeightsTotal += weights.soch;
  }

  if (activeWeightsTotal === 0) return 0;
  return total / activeWeightsTotal;
};

export const getGradeColors = (grade: number) => {
  switch (grade) {
    case 5:
    case 4: return { bg: '#4B9A25', text: '#ffffff', border: '#4B9A25', solid: '#4B9A25' };
    case 3: return { bg: '#FF8F00', text: '#ffffff', border: '#FF8F00', solid: '#FF8F00' };
    case 2: return { bg: '#aa2834', text: '#ffffff', border: '#aa2834', solid: '#aa2834' };
    default: return { bg: '#f8fafc', text: '#334155', border: '#e2e8f0', solid: '#cbd5e1' };
  }
};

export const getFoColor = (num: number) => {
  if (num >= 8) return getGradeColors(5);
  if (num >= 5) return getGradeColors(3);
  return getGradeColors(2);
};

export const getScoreColor = (score: number, max: number) => {
  if (!max || max <= 0) return getGradeColors(0);
  const percent = (score / max) * 100;
  return getGradeColors(getGradeFromPercent(percent));
};

