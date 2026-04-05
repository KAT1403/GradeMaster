import styles from "./ProgressBar.module.scss";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  variant?: "high" | "medium" | "low" | "impossible" | "absolute";
}

export const ProgressBar = ({
  value,
  max = 100,
  className,
  variant = "medium",
}: ProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);

  const getVariantClass = () => {
    switch (variant) {
      case "absolute":
        return styles.absolute;
      case "high":
        return styles.high;
      case "medium":
        return styles.medium;
      case "low":
        return styles.low;
      case "impossible":
        return styles.impossible;
      default:
        return styles.medium;
    }
  };

  return (
    <div className={`${styles.progressBar} ${className || ""}`}>
      <div
        className={`${styles.fill} ${getVariantClass()}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
