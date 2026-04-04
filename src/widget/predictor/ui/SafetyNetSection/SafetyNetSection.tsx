import { useTranslation } from "react-i18next";
import { ScenarioCard } from "../../../../shared/ui/ScenarioCard";
import { SCENARIOS } from "../../model/constants";
import type { SafetyNetSectionProps } from "../../model/types";
import styles from "./SafetyNetSection.module.scss";

export const SafetyNetSection = ({
  predictions,
  hasSoch,
}: SafetyNetSectionProps) => {
  const { t } = useTranslation();

  if (hasSoch) return null;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>{t("predictor.sections.safety_net")}</h2>

      <ScenarioCard
        icon={SCENARIOS.SAFETY_NET.icon}
        title={t("predictor.safety_net.title")}
      >
        <ul className={styles.content}>
          <li>
            {t("predictor.safety_net.avoid_3", {
              percent: predictions.safetyNet.avoid3SochPct,
            })}
          </li>
          <li>
            {t("predictor.safety_net.avoid_2", {
              percent: predictions.safetyNet.avoid2SochPct,
            })}
          </li>
        </ul>
      </ScenarioCard>
    </div>
  );
};
