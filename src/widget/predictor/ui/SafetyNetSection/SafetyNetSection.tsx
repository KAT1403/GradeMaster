import { useTranslation } from "react-i18next";
import { ScenarioCard } from "../../../../shared/ui/ScenarioCard";
import { SCENARIOS } from "../../model/constants";
import type { SafetyNetSectionProps } from "../../model/types";
import styles from "./SafetyNetSection.module.scss";

export const SafetyNetSection = ({
  predictions,
  hasSoch,
  targetGrade,
  sochMaxScore,
}: SafetyNetSectionProps) => {
  const { t } = useTranslation();

  if (hasSoch) return null;
  if (targetGrade === 3) return null;

  const showAvoid3 = targetGrade === 5;
  const showAvoid2 = targetGrade === 4 || targetGrade === 5;
  const avoid3Impossible = predictions.safetyNet.avoid3SochPct > 100;
  const avoid2Impossible = predictions.safetyNet.avoid2SochPct > 100;

  const avoid3Score = Math.ceil(
    (predictions.safetyNet.avoid3SochPct / 100) * sochMaxScore,
  );
  const avoid2Score = Math.ceil(
    (predictions.safetyNet.avoid2SochPct / 100) * sochMaxScore,
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>{t("predictor.sections.safety_net")}</h2>

      <ScenarioCard
        icon={SCENARIOS.SAFETY_NET.icon}
        title={t("predictor.safety_net.title")}
      >
        <ul className={styles.content}>
          {showAvoid3 && (
            <li>
              {avoid3Impossible
                ? t("predictor.safety_net.avoid_3_impossible")
                : t("predictor.safety_net.avoid_3_with_score", {
                    percent: predictions.safetyNet.avoid3SochPct,
                    score: avoid3Score,
                    max: sochMaxScore,
                  })}
            </li>
          )}
          {showAvoid2 && (
            <li>
              {avoid2Impossible
                ? t("predictor.safety_net.avoid_2_impossible")
                : t("predictor.safety_net.avoid_2_with_score", {
                    percent: predictions.safetyNet.avoid2SochPct,
                    score: avoid2Score,
                    max: sochMaxScore,
                  })}
            </li>
          )}
        </ul>
      </ScenarioCard>
    </div>
  );
};
