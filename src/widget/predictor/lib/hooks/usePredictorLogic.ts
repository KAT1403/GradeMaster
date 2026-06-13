import { useMemo } from "react";
import { analyzePrediction } from "../../../../shared/lib/predictor";
import {
  calculateTotalPercent,
  isCompleteScore,
} from "../../../../shared/lib/grading";
import { checkIfScoreImproves } from "../../../../shared/lib/predictor/checkIfScoreImproves";
import type { PredictorLogicProps, PredictorState } from "../../model/types";

export const usePredictorLogic = ({
  state,
  targetGrade,
  badScoreMode,
  sochMaxScore,
}: PredictorLogicProps): PredictorState => {
  return useMemo(() => {
    const system = state.selectedSystem === "kundelik" ? "kundelik" : state.selectedSystem === "gpa" ? "gpa" : "bilim_class";
    const predictions = analyzePrediction(state, targetGrade, sochMaxScore, system);
    const hasSoch = Boolean(
      state.soch &&
        isCompleteScore(state.soch.score, state.soch.max),
    );
    const currentPercent = calculateTotalPercent(state, system);
    const isAlreadyBelowTarget = currentPercent < predictions.targetPercent;
    const willImprove = checkIfScoreImproves(state, badScoreMode);

    return {
      predictions,
      hasSoch,
      currentPercent,
      isAlreadyBelowTarget,
      willImprove,
    };
  }, [state, targetGrade, badScoreMode, sochMaxScore]);
};
