import styles from "../../../widget/predictor/ui/PredictorWidget.module.scss";

export const getProbabilityClass = (
  level: "high" | "medium" | "low" | "impossible" | "absolute",
): string => {
  switch (level) {
    case "absolute":
      return styles.probAbsolute;
    case "high":
      return styles.probHigh;
    case "medium":
      return styles.probMedium;
    case "low":
      return styles.probLow;
    case "impossible":
      return styles.probImpossible;
    default:
      return styles.probLow;
  }
};
