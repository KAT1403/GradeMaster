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

  // [ЭВРИСТИЧЕСКИЙ РАСЧЁТ ВЕРОЯТНОСТИ "УСИЛИЙ"]
  let score = 0;
  const currentTotal = calculateTotalPercent(params);
  const isGoalReached = currentTotal >= targetPercent;

  if (isGoalReached && params.soch && params.soch.max > 0) {
    score = 100;
  } else if (!isSochPossible && !isFoPossible) {
    score = 0;
  } else {
    let sochScore = 0;
    if (params.soch && params.soch.max > 0) {
      sochScore = (params.soch.score / params.soch.max) * 100;
    } else {
      if (requiredSochPercent <= 20) sochScore = 100;
      else if (requiredSochPercent <= 40) sochScore = 90;
      else if (requiredSochPercent <= 60) sochScore = 75;
      else if (requiredSochPercent <= 80) sochScore = 65;
      else if (requiredSochPercent <= 90) sochScore = 45;
      else if (requiredSochPercent <= 95) sochScore = 25;
      else sochScore = 10;
    }

    let foScore = 0;
    if (isFoPossible) {
      if (needed10s === 0) {
        foScore = Math.min(100, 50 + (currentCapital / targetPercent) * 50);
      } else if (needed10s <= 2) {
        foScore = 90;
      } else if (needed10s <= 4) {
        foScore = 80;
      } else if (needed10s <= 6) {
        foScore = 65;
      } else if (needed10s <= 10) {
        foScore = 45;
      } else {
        foScore = 35;
      }
    } else {
      foScore = 0;
    }

    score = sochScore * 0.55 + foScore * 0.45;

    if (!params.soch || params.soch.max === 0) {
      const progressBonus = Math.max(
        0,
        Math.round((currentCapital / targetPercent) * 10 - 3),
      );
      const stabilityBonus = currentTotal >= targetPercent + 10
        ? 15
        : currentTotal >= targetPercent + 7
        ? 10
        : currentTotal >= targetPercent + 5
        ? 7
        : 0;
      score = Math.min(99, score + progressBonus + stabilityBonus);
    }
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
