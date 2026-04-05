import { calculateTotalPercent, type CalculateParams } from "./grading";

export interface PredictorData {
  targetGrade: 3 | 4 | 5;
  targetPercent: number;
  currentTotalBeforeSoch: number;
  maxPossibleTotal: number;

  sochScenario: {
    requiredPercent: number;
    isPossible: boolean;
  };

  foScenario: {
    needed10s: number;
    isPossible: boolean;
  };

  safetyNet: {
    avoid2SochPct: number;
    avoid3SochPct: number;
  };

  errorMargin: {
    allowed1s: number;
    allowedBadCounts: Record<number, number>;
  };

  probability: {
    score: number;
    range: [number, number];
    level: "high" | "medium" | "low" | "impossible";
  };
}

export const analyzePrediction = (
  params: CalculateParams,
  targetGrade: 3 | 4 | 5,
): PredictorData => {
  const { fos, sors } = params;
  const targetPercent =
    targetGrade === 5 ? 84.5 : targetGrade === 4 ? 64.5 : 39.5;

  let currentCapital = 0;
  const weights = { fo: 0.25, sor: 0.25, soch: 0.5 };

  if (fos.length > 0) {
    const avgFO = fos.reduce((sum, val) => sum + val, 0) / fos.length;
    currentCapital += (avgFO / 10) * weights.fo * 100;
  }
  if (sors.length > 0) {
    const validSors = sors.filter((s) => s.max > 0);
    if (validSors.length > 0) {
      const avgSorPercent =
        validSors.reduce((sum, s) => sum + s.score / s.max, 0) /
        validSors.length;
      currentCapital += avgSorPercent * weights.sor * 100;
    }
  }

  const maxPossibleTotal = currentCapital + weights.soch * 100;
  const missingPoints = targetPercent - currentCapital;
  let requiredSochPercent = Math.ceil((missingPoints / 50) * 100);
  if (requiredSochPercent < 0) requiredSochPercent = 0;
  const isSochPossible = requiredSochPercent <= 100;
  let needed10s = 0;
  let isFoPossible = false;
  const simFos = [...fos];
  if (calculateTotalPercent(params) >= targetPercent) {
    isFoPossible = true;
    needed10s = 0;
  } else {
    for (let i = 1; i <= 50; i++) {
      simFos.push(10);
      const testScore = calculateTotalPercent({ ...params, fos: simFos });
      if (testScore >= targetPercent) {
        needed10s = i;
        isFoPossible = true;
        break;
      }
    }
  }
  const missingFor40 = 39.5 - currentCapital;
  const missingFor65 = 64.5 - currentCapital;

  let avoid2Pct = Math.ceil((missingFor40 / 50) * 100);
  let avoid3Pct = Math.ceil((missingFor65 / 50) * 100);
  if (avoid2Pct < 0) avoid2Pct = 0;
  if (avoid3Pct < 0) avoid3Pct = 0;
  let allowed1s = 0;
  const allowedBadCounts: Record<number, number> = {};
  if (calculateTotalPercent(params) >= targetPercent) {
    const errFos = [...fos];
    for (let i = 1; i <= 30; i++) {
      errFos.push(1);
      const testScore = calculateTotalPercent({ ...params, fos: errFos });
      if (testScore < targetPercent) {
        break;
      }
      allowed1s = i;
    }
    for (let badScore = 1; badScore <= 9; badScore++) {
      let allowed = 0;
      const testFos = [...fos];
      for (let i = 1; i <= 30; i++) {
        testFos.push(badScore);
        const testScore = calculateTotalPercent({ ...params, fos: testFos });
        if (testScore < targetPercent) {
          break;
        }
        allowed = i;
      }
      allowedBadCounts[badScore] = allowed;
    }
  } else {
    for (let badScore = 1; badScore <= 9; badScore++) {
      allowedBadCounts[badScore] = 0;
    }
  }

  // [ЭВРИСТИЧЕСКИЙ РАСЧЕТ ВЕРОЯТНОСТИ "УСИЛИЙ"]
  
  let score = 0;
  const currentTotal = calculateTotalPercent(params);
  const isGoalReached = currentTotal >= targetPercent;

  if (isGoalReached && params.soch && params.soch.max > 0) {
    // Если СОЧ сдан и оценка уже на месте - это успех (99%)
    score = 100;
  } else if (!isSochPossible && !isFoPossible) {
    score = 0;
  } else {
    // 1. Оцениваем шансы по СОЧ/СОР
    let sochScore = 0;
    if (params.soch && params.soch.max > 0) {
      const sochRel = params.soch.score / params.soch.max;
      sochScore = sochRel * 100;
    } else {
      if (requiredSochPercent <= 40) sochScore = 95;
      else if (requiredSochPercent <= 60) sochScore = 80;
      else if (requiredSochPercent <= 80) sochScore = 50;
      else if (requiredSochPercent <= 90) sochScore = 20; 
      else sochScore = 10; 
    }

    // 2. Оцениваем шансы по ФО
    let foScore = 0;
    if (isFoPossible) {
      if (needed10s === 0) {
        foScore = 100; 
      } else {
        const effortRatio =  needed10s / (fos.length || 1);
        if (effortRatio <= 0.2) foScore = 95;
        else if (effortRatio <= 0.5) foScore = 70;
        else if (effortRatio <= 1) foScore = 35;
        else if (effortRatio <= 2) foScore = 15;
        else foScore = 5;
      }
    } else {
      foScore = 0;
    }

    // 3. Итоговый баланс (СОЧ весит 60%, ФО 40%)
    score = (sochScore * 0.6) + (foScore * 0.4);
  }


  const probScore = Math.min(99, Math.round(score));
  const range: [number, number] = [
    Math.max(0, probScore - 2),
    Math.min(99, probScore + 1),
  ];

  let probLevel: "high" | "medium" | "low" | "impossible" = "low";
  if (probScore >= 75) probLevel = "high";
  else if (probScore >= 35) probLevel = "medium";
  else if (probScore > 0) probLevel = "low";
  else probLevel = "impossible";

  return {
    targetGrade,
    targetPercent,
    currentTotalBeforeSoch: currentCapital,
    maxPossibleTotal,
    sochScenario: {
      requiredPercent: requiredSochPercent,
      isPossible: isSochPossible,
    },
    foScenario: { needed10s, isPossible: isFoPossible },
    safetyNet: { avoid2SochPct: avoid2Pct, avoid3SochPct: avoid3Pct },
    errorMargin: { allowed1s, allowedBadCounts },
    probability: { score: probScore, level: probLevel, range },
  };
};
