import { useState } from "react";
import { useAcademicRecordStore } from "../../../entities/academic-record/model/store";
import { useUIStore } from "../../../app/store/uiStore";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { usePredictorLogic } from "../lib";
import { TargetSelector } from "./TargetSelector";
import { ScenariosSection } from "./ScenariosSection";
import { SafetyNetSection } from "./SafetyNetSection";
import { MetricsSection } from "./MetricsSection";
import styles from "./PredictorWidget.module.scss";

export const PredictorWidget = () => {
  const state = useAcademicRecordStore();
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const [targetGrade, setTargetGrade] = useState<3 | 4 | 5>(5);
  const [badScoreMode, setBadScoreMode] = useState<number>(4);

  const predictorLogic = usePredictorLogic({
    state,
    targetGrade,
    badScoreMode,
  });

  if (predictorLogic.predictions.currentTotalBeforeSoch === 0) {
    return (
      <div className={styles.container}>
        <EmptyState onNavigate={() => setActiveTab("calculator")} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <TargetSelector
        targetGrade={targetGrade}
        onTargetChange={setTargetGrade}
      />
      <ScenariosSection
        predictions={predictorLogic.predictions}
        targetGrade={targetGrade}
        hasSoch={predictorLogic.hasSoch}
      />
      <SafetyNetSection
        predictions={predictorLogic.predictions}
        targetGrade={targetGrade}
        hasSoch={predictorLogic.hasSoch}
      />
      <MetricsSection
        predictions={predictorLogic.predictions}
        targetGrade={targetGrade}
        badScoreMode={badScoreMode}
        onBadScoreChange={setBadScoreMode}
        isAlreadyBelowTarget={predictorLogic.isAlreadyBelowTarget}
        currentPercent={predictorLogic.currentPercent}
        willImprove={predictorLogic.willImprove}
      />
    </div>
  );
};
