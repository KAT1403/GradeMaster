import type { SOR } from "../types/academic";
import { isCompleteScore } from "./grading";

export const calculateStdDev = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squareDiffs = numbers.map((n) => Math.pow(n - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  return Math.sqrt(avgSquareDiff);
};

export const calculateVolatility = (stdDev: number): number => {
  return Math.min(100, Math.max(0, (stdDev / 4.0) * 100));
};

export interface GradeForecast {
  realistic: number;
  optimistic: number;
  pessimistic: number;
}

const TREND_DECAY = 0.75;
const REVERSION = 0.15;
const BAND_WIDTH = 0.9;
const MIN_SPREAD = 0.5;

interface TrendFit {
  slope: number;
  level: number;
  correlation: number;
  residual: number;
}
const fitTrend = (values: number[]): TrendFit => {
  const n = values.length;
  if (n < 3)
    return { slope: 0, level: values[n - 1], correlation: 0, residual: 0 };

  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;

  let covariance = 0;
  let varianceX = 0;
  for (let i = 0; i < n; i++) {
    covariance += (i - meanX) * (values[i] - meanY);
    varianceX += (i - meanX) * (i - meanX);
  }

  const slope = varianceX === 0 ? 0 : covariance / varianceX;
  const intercept = meanY - slope * meanX;

  let ssResidual = 0;
  let ssTotal = 0;
  for (let i = 0; i < n; i++) {
    ssResidual += Math.pow(values[i] - (intercept + slope * i), 2);
    ssTotal += Math.pow(values[i] - meanY, 2);
  }

  return {
    slope,
    level: intercept + slope * (n - 1),
    correlation:
      ssTotal > 0 ? Math.sqrt(Math.max(0, 1 - ssResidual / ssTotal)) : 0,
    residual: Math.sqrt(ssResidual / n),
  };
};

const recentWeightedAverage = (values: number[]): number => {
  const n = values.length;
  if (n >= 3)
    return values[n - 1] * 0.5 + values[n - 2] * 0.3 + values[n - 3] * 0.2;
  if (n === 2) return values[1] * 0.6 + values[0] * 0.4;
  return values[0];
};

export const predictFutureGrades = (
  history: number[],
  steps: number = 5,
  min: number = 1,
  max: number = 10,
): GradeForecast[] => {
  if (history.length === 0)
    return Array.from({ length: steps }, () => ({
      realistic: 0,
      optimistic: 0,
      pessimistic: 0,
    }));

  const n = history.length;
  const fit = fitTrend(history);
  const level = 0.6 * history[n - 1] + 0.4 * fit.level;
  const slope = fit.slope * fit.correlation * Math.min(1, n / 4);
  const target = recentWeightedAverage(history);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  return Array.from({ length: steps }, (_, index) => {
    const step = index + 1;
    const trend =
      slope *
      TREND_DECAY *
      ((1 - Math.pow(TREND_DECAY, step)) / (1 - TREND_DECAY));

    const pull =
      (target - level) *
      (1 - fit.correlation) *
      (1 - Math.pow(1 - REVERSION, step));

    const center = clamp(level + trend + pull);
    const spread =
      Math.max(fit.residual, MIN_SPREAD) * Math.sqrt(step) * BAND_WIDTH;

    return {
      realistic: Math.round(center),
      optimistic: Math.ceil(clamp(center + spread)),
      pessimistic: Math.floor(clamp(center - spread)),
    };
  });
};

export const calculateCorrelationScore = (fos: number[], sors: SOR[]) => {
  const validSors = sors.filter((s) => isCompleteScore(s.score, s.max));
  if (fos.length === 0 || validSors.length === 0) return 0;

  const avgFO = fos.reduce((a, b) => a + b, 0) / fos.length / 10;
  const avgSORPercent =
    validSors.reduce((sum, s) => sum + (s.score ?? 0) / (s.max ?? 1), 0) /
    validSors.length;

  return Math.abs(avgFO - avgSORPercent) * 100;
};

export type TrendType = "progress" | "regress" | "stable";

export const calculateTextualTrend = (fos: number[]): TrendType => {
  if (fos.length < 3) return "stable";

  const segmentSize = Math.max(1, Math.floor(fos.length / 3));
  const firstSegment = fos.slice(0, segmentSize);
  const lastSegment = fos.slice(-segmentSize);
  const totalAvg = fos.reduce((a, b) => a + b, 0) / fos.length;

  const avgFirst =
    firstSegment.reduce((a, b) => a + b, 0) / firstSegment.length;
  const avgLast = lastSegment.reduce((a, b) => a + b, 0) / lastSegment.length;

  const trendPower = (avgLast - avgFirst + (avgLast - totalAvg)) / 2;

  if (trendPower > 0.3) return "progress";
  if (trendPower < -0.3) return "regress";
  return "stable";
};
