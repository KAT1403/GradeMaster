export const SCENARIOS = {
  SUCCESS: { icon: "🏆", titleKey: "predictor.scenarios.already_achieved" },
  SOCH: { icon: "🎯", titleKey: "predictor.scenarios.through_soch" },
  FO: { icon: "📝", titleKey: "predictor.scenarios.through_fo" },
  SAFETY_NET: { icon: "🛡️", titleKey: "predictor.safety_net.title" },
  ERROR_MARGIN: { icon: "⚖️", titleKey: "predictor.error_margin.title" },
  PROBABILITY: { icon: "📊", titleKey: "predictor.probability.title" },
} as const;

export const GRADE_OPTIONS = [3, 4, 5] as const;

export const GOOD_SCORE_THRESHOLD = 7;
