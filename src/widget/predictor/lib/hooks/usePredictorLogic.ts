import { useMemo } from "react";
import { analyzePrediction } from "../../../../shared/lib/predictor";
import { calculateTotalPercent } from "../../../../shared/lib/grading";
import { checkIfScoreImproves } from "../../../../shared/lib/predictor/checkIfScoreImproves";
import type { PredictorLogicProps, PredictorState } from "../../model/types";

export const usePredictorLogic = ({
  state,
  targetGrade,
  badScoreMode,
}: PredictorLogicProps): PredictorState => {
  return useMemo(() => {
    const predictions = analyzePrediction(state, targetGrade);
    const hasSoch = Boolean(state.soch?.score && state.soch.max > 0);
    const currentPercent = calculateTotalPercent(state);
    const isAlreadyBelowTarget = currentPercent < predictions.targetPercent;
    const willImprove = checkIfScoreImproves(state, badScoreMode);

    return {
      predictions,
      hasSoch,
      currentPercent,
      isAlreadyBelowTarget,
      willImprove,
    };
  }, [state, targetGrade, badScoreMode]);
};
