import { useState } from "react";
import { useAcademicRecordStore } from "../../../entities/academic-record/model/store";
import { useUIStore } from "../../../shared/store/uiStore";
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
  const [sochMaxScore, setSochMaxScore] = useState<number>(20);

  const predictorLogic = usePredictorLogic({
    state,
    targetGrade,
    badScoreMode,
    sochMaxScore,
  });

  if (predictorLogic.predictions.currentTotalBeforeSoch === 0) {
    return (
      <div className={styles.container}>
        <EmptyState onNavigate={() => setActiveTab("workspace")} />
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
        sochMaxScore={sochMaxScore}
        onSochMaxScoreChange={setSochMaxScore}
      />
      <SafetyNetSection
        predictions={predictorLogic.predictions}
        targetGrade={targetGrade}
        hasSoch={predictorLogic.hasSoch}
        sochMaxScore={sochMaxScore}
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
