import type { CalculateParams } from "../../../shared/lib/grading";

export interface PredictorLogicProps {
  state: CalculateParams;
  targetGrade: 3 | 4 | 5;
  badScoreMode: number;
  sochMaxScore: number;
}

export interface PredictorState {
  predictions: {
    currentTotalBeforeSoch: number;
    targetPercent: number;
    sochScenario: {
      requiredPercent: number;
      isPossible: boolean;
      requiredScore?: number;
      maxScore?: number;
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
      range: [number, number];
      level: "high" | "medium" | "low" | "impossible";
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
  sochMaxScore: number;
  onSochMaxScoreChange: (value: number) => void;
}

export interface SafetyNetSectionProps {
  predictions: PredictorState["predictions"];
  hasSoch: boolean;
  targetGrade: 3 | 4 | 5;
  sochMaxScore: number;
}

export interface MetricsSectionProps {
  predictions: PredictorState["predictions"];
  targetGrade: 3 | 4 | 5;
  badScoreMode: number;
  onBadScoreChange: (score: number) => void;
  isAlreadyBelowTarget: boolean;
  currentPercent: number;
  willImprove: boolean;
}
