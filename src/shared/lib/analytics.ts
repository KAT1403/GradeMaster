import type { SOR } from "../types/academic";

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

export const predictFutureGrades = (history: number[], steps: number = 5) => {
  if (history.length === 0) return Array(steps).fill({ realistic: 0 });

  const totalAvg = history.reduce((a, b) => a + b, 0) / history.length;
  const stdDev = calculateStdDev(history);
  const volFactor = Math.min(0.5, stdDev / 4);
  const results = [];
  const simulatedHistory = [...history];

  for (let i = 0; i < steps; i++) {
    const len = simulatedHistory.length;
    let wma: number;

    if (len >= 3) {
      wma = (simulatedHistory[len - 1] * 0.5) + (simulatedHistory[len - 2] * 0.3) + (simulatedHistory[len - 3] * 0.2);
    } else if (len === 2) {
      wma = (simulatedHistory[len - 1] * 0.6) + (simulatedHistory[len - 2] * 0.4);
    } else {
      wma = simulatedHistory[0];
    }

    const predictedWithVol = (wma * (1 - volFactor)) + (totalAvg * volFactor);
    const finalGrade = Math.round(Math.min(10, Math.max(1, predictedWithVol)));
    
    results.push({ realistic: finalGrade });
    simulatedHistory.push(finalGrade);
  }

  return results;
};

export const calculateCorrelationScore = (fos: number[], sors: SOR[]) => {
  const validSors = sors.filter(s => s.max > 0);
  if (fos.length === 0 || validSors.length === 0) return 0;
  
  const avgFO = (fos.reduce((a, b) => a + b, 0) / fos.length) / 10;
  const avgSORPercent = validSors.reduce((sum, s) => sum + (s.score / s.max), 0) / validSors.length;
  
  return Math.abs(avgFO - avgSORPercent) * 100;
};

export type TrendType = 'progress' | 'regress' | 'stable';

export const calculateTextualTrend = (fos: number[]): TrendType => {
  if (fos.length < 3) return 'stable';
  
  const segmentSize = Math.max(1, Math.floor(fos.length / 3));
  const firstSegment = fos.slice(0, segmentSize);
  const lastSegment = fos.slice(-segmentSize);
  const totalAvg = fos.reduce((a, b) => a + b, 0) / fos.length;
  
  const avgFirst = firstSegment.reduce((a, b) => a + b, 0) / firstSegment.length;
  const avgLast = lastSegment.reduce((a, b) => a + b, 0) / lastSegment.length;
  
  const trendPower = ((avgLast - avgFirst) + (avgLast - totalAvg)) / 2;
  
  if (trendPower > 0.3) return 'progress';
  if (trendPower < -0.3) return 'regress';
  return 'stable';
};
