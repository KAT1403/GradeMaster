import type { CalculateParams } from "../../../shared/lib/grading";

export interface PredictorLogicProps {
  state: CalculateParams;
  targetGrade: 3 | 4 | 5;
  badScoreMode: number;
}

export interface PredictorState {
  predictions: {
    currentTotalBeforeSoch: number;
    targetPercent: number;
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
      allowedBadCounts: Record<number, number>;
    };
    probability: {
      score: number;
      level: "high" | "medium" | "low";
    };
  };
  hasSoch: boolean;
  currentPercent: number;
  isAlreadyBelowTarget: boolean;
  willImprove: boolean;
}

export interface EmptyStateProps {
  onNavigate: () => void;
}

export interface TargetSelectorProps {
  targetGrade: 3 | 4 | 5;
  onTargetChange: (grade: 3 | 4 | 5) => void;
}

export interface ScenarioSectionProps {
  predictions: PredictorState["predictions"];
  targetGrade: 3 | 4 | 5;
  hasSoch: boolean;
}

export interface SafetyNetSectionProps {
  predictions: PredictorState["predictions"];
  hasSoch: boolean;
}

export interface AnalyticsSectionProps {
  predictions: PredictorState["predictions"];
  targetGrade: 3 | 4 | 5;
  badScoreMode: number;
  onBadScoreChange: (score: number) => void;
  isAlreadyBelowTarget: boolean;
  currentPercent: number;
  willImprove: boolean;
}
