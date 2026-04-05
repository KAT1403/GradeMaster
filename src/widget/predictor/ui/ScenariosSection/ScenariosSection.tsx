import { useTranslation } from "react-i18next";
import { ScenarioCard } from "../../../../shared/ui/ScenarioCard";
import { SCENARIOS } from "../../model/constants";
import type { ScenarioSectionProps } from "../../model/types";
import styles from "./ScenariosSection.module.scss";

export const ScenariosSection = ({
  predictions,
  targetGrade,
  hasSoch,
}: ScenarioSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>{t("predictor.sections.how_to_reach")}</h2>
      
      <div className={styles.gridScenarios}>
        {!hasSoch && (
          <ScenarioCard
            icon={SCENARIOS.SOCH.icon}
            title={t("predictor.scenarios.through_soch")}
          >
            <p className={styles.content}>
              {predictions.sochScenario.requiredPercent <= 0
                ? t("predictor.scenarios.zero_soch_enough", { grade: targetGrade })
                : predictions.sochScenario.isPossible
                  ? t("predictor.scenarios.soch_possible", {
                      grade: targetGrade,
                      percent: predictions.sochScenario.requiredPercent,
                    })
                  : t("predictor.scenarios.soch_impossible", {
                      grade: targetGrade,
                    })}
            </p>
          </ScenarioCard>
        )}
        
        <ScenarioCard
          icon={SCENARIOS.FO.icon}
          title={t("predictor.scenarios.through_fo")}
        >
          <p className={styles.content}>
            {predictions.foScenario.isPossible && predictions.foScenario.needed10s > 0
              ? t("predictor.scenarios.fo_possible", {
                  grade: targetGrade,
                  count: predictions.foScenario.needed10s,
                })
              : predictions.foScenario.isPossible
                ? t("predictor.scenarios.fo_not_needed")
                : t("predictor.scenarios.fo_impossible", {
                    grade: targetGrade,
                  })}
          </p>
        </ScenarioCard>
      </div>
    </div>
  );
};
