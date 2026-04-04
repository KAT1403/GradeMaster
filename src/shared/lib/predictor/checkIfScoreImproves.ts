import { calculateTotalPercent } from "../grading";
import type { CalculateParams } from "../grading";

export const checkIfScoreImproves = (
  state: CalculateParams,
  score: number,
): boolean => {
  const currentPercent = calculateTotalPercent(state);
  const testState = { ...state, fos: [...state.fos, score] };
  const newPercent = calculateTotalPercent(testState);
  return newPercent > currentPercent;
};
