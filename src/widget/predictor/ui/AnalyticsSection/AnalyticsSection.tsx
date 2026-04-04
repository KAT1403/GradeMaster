import { useTranslation } from "react-i18next";
import { ScenarioCard } from "../../../../shared/ui/ScenarioCard";
import { ProgressBar } from "../../../../shared/ui/ProgressBar";
import { getProbabilityClass } from "../../../../shared/lib/predictor/getProbabilityClass";
import { SCENARIOS, GOOD_SCORE_THRESHOLD } from "../../model/constants";
import type { AnalyticsSectionProps } from "../../model/types";
import styles from "./AnalyticsSection.module.scss";

export const AnalyticsSection = ({
  predictions,
  targetGrade,
  badScoreMode,
  onBadScoreChange,
  isAlreadyBelowTarget,
  currentPercent,
  willImprove,
}: AnalyticsSectionProps) => {
  const { t } = useTranslation();

  const getErrorMarginText = () => {
    if (isAlreadyBelowTarget) {
      if (badScoreMode >= GOOD_SCORE_THRESHOLD) {
        return t("predictor.error_margin.below_target_good", {
          current: Math.round(currentPercent),
          score: badScoreMode,
        });
      } else {
        return t("predictor.error_margin.below_target_bad", {
          current: Math.round(currentPercent),
          score: badScoreMode,
          target: targetGrade,
        });
      }
    }

    if (willImprove) {
      return t("predictor.error_margin.improves", { score: badScoreMode });
    }

    if (predictions.errorMargin.allowedBadCounts[badScoreMode] > 0) {
      return t("predictor.error_margin.allowed", {
        count: predictions.errorMargin.allowedBadCounts[badScoreMode],
        score: badScoreMode,
        target: targetGrade,
      });
    }

    return t("predictor.error_margin.none", {
      score: badScoreMode,
      target: targetGrade,
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>{t("predictor.sections.analytics")}</h2>

      <div className={styles.grid}>
        <ScenarioCard
          icon={SCENARIOS.ERROR_MARGIN.icon}
          title={t("predictor.error_margin.title")}
        >
          <div className={styles.scoreSelector}>
            <span className={styles.label}>
              {t("predictor.error_margin.if_score")}
            </span>
            <select
              value={badScoreMode}
              onChange={(e) => onBadScoreChange(Number(e.target.value))}
              className={styles.select}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <p className={styles.content}>{getErrorMarginText()}</p>
        </ScenarioCard>
        <ScenarioCard
          icon={SCENARIOS.PROBABILITY.icon}
          title={t("predictor.probability.title")}
        >
          <p className={styles.content}>
            {t("predictor.probability.based_on")}
          </p>

          <ProgressBar
            value={predictions.probability.score}
            variant={predictions.probability.level}
            className={styles.progressBar}
          />

          <span
            className={`${styles.statusBadge} ${getProbabilityClass(predictions.probability.level)}`}
          >
            {predictions.probability.score}%
          </span>
        </ScenarioCard>
      </div>
    </div>
  );
};
