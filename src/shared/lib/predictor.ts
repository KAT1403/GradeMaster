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
    level: "high" | "medium" | "low";
  };
}

export const analyzePrediction = (
  params: CalculateParams,
  targetGrade: 3 | 4 | 5,
): PredictorData => {
  const { fos, sors } = params;
  const targetPercent = targetGrade === 5 ? 85 : targetGrade === 4 ? 65 : 40;

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
  const missingFor40 = 40 - currentCapital;
  const missingFor65 = 65 - currentCapital;
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

  const avgFo = fos.length ? fos.reduce((a, b) => a + b, 0) / fos.length : 0;
  const avgSorPercent =
    sors.length > 0
      ? sors
          .filter((s) => s.max > 0)
          .reduce((sum, s) => sum + s.score / s.max, 0) /
        sors.filter((s) => s.max > 0).length
      : 0;
  let probScore = 0;

  if (calculateTotalPercent(params) >= targetPercent) {
    probScore = 100;
  } else if (isSochPossible) {
    const requiredRel = requiredSochPercent / 100;
    const histRel = avgFo ? avgFo / 10 : 0.7;
    const sorRel = avgSorPercent;

    const foVariance =
      fos.length > 1
        ? Math.sqrt(
            fos.reduce((sum, val) => sum + Math.pow(val - avgFo, 2), 0) /
              fos.length,
          )
        : 2;
    const foStability = Math.max(0, 1 - foVariance / 10);

    let baseProb =
      50 + (histRel - requiredRel) * 60 + (sorRel - requiredRel) * 40;

    if (histRel >= 0.8) baseProb += 15;
    if (sorRel >= 0.8) baseProb += 15;
    if (histRel >= requiredRel) baseProb += 20;
    if (sorRel >= requiredRel) baseProb += 15;
    if (foStability >= 0.7) baseProb += 10;
    else if (foStability < 0.4) baseProb -= 15;

    if (requiredSochPercent >= 90) baseProb -= 20;
    else if (requiredSochPercent >= 80) baseProb -= 10;
    else if (requiredSochPercent <= 60) baseProb += 10;

    probScore = baseProb;
  } else if (isFoPossible && needed10s <= 10) {
    const recentTrend =
      fos.length >= 3
        ? fos.slice(-3).reduce((a, b) => a + b, 0) / 3 - avgFo
        : 0;

    let baseProb = 30;

    if (recentTrend > 1) baseProb += 15;
    else if (recentTrend < -1) baseProb -= 15;

    if (avgFo >= 8) baseProb += 15;
    else if (avgFo >= 6) baseProb += 5;
    else baseProb -= 10;

    if (avgSorPercent >= 0.8) baseProb += 10;
    else if (avgSorPercent >= 0.6) baseProb += 5;
    else if (avgSorPercent < 0.4) baseProb -= 10;

    if (needed10s <= 3) baseProb += 20;
    else if (needed10s <= 5) baseProb += 10;
    else if (needed10s >= 8) baseProb -= 15;

    probScore = baseProb;
  }

  if (allowed1s === 0 && !isFoPossible && !isSochPossible) probScore -= 20;
  if (fos.length >= 8) probScore += 5;
  if (fos.length <= 2) probScore -= 10;
  if (sors.length >= 3) probScore += 5;
  if (sors.length <= 1) probScore -= 5;

  probScore = Math.max(0, Math.min(99, Math.round(probScore)));
  if (calculateTotalPercent(params) >= targetPercent) probScore = 100;
  let probLevel: "high" | "medium" | "low" = "low";
  if (probScore >= 75) probLevel = "high";
  else if (probScore >= 40) probLevel = "medium";

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
    probability: { score: probScore, level: probLevel },
  };
};
