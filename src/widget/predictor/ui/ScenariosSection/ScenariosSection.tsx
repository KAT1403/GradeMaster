import { useTranslation } from "react-i18next";
import { ScenarioCard } from "../../../../shared/ui/ScenarioCard";
import { SCENARIOS } from "../../model/constants";
import type { ScenarioSectionProps } from "../../model/types";
import styles from "./ScenariosSection.module.scss";

export const ScenariosSection = ({
  predictions,
  targetGrade,
  hasSoch,
  sochMaxScore,
  onSochMaxScoreChange,
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
            <div className={styles.sochInputContainer}>
              <label htmlFor="soch-max-score">
                {t("predictor.scenarios.soch_max_score_label")}:
              </label>
              <input
                id="soch-max-score"
                type="number"
                min="0"
                max="1000"
                placeholder="20"
                value={sochMaxScore === 0 ? "" : sochMaxScore}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  // Запрещаем ввод букв, знаков препинания и пробелов
                  if (e.key.length === 1 && !/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value;

                  // Ограничиваем длину до 3 знаков и только цифры
                  const cleanValue = value.replace(/[^0-9]/g, "").slice(0, 3);

                  if (cleanValue === "" || cleanValue === undefined) {
                    onSochMaxScoreChange(0);
                  } else {
                    const numValue = Number(cleanValue);
                    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                      onSochMaxScoreChange(numValue);
                    }
                  }
                }}
                className={styles.sochInput}
              />
            </div>
            <p className={styles.content}>
              {predictions.sochScenario.requiredPercent <= 0
                ? t("predictor.scenarios.zero_soch_enough", {
                    grade: targetGrade,
                  })
                : predictions.sochScenario.isPossible &&
                    predictions.sochScenario.requiredScore !== undefined
                  ? t("predictor.scenarios.soch_score_needed", {
                      grade: targetGrade,
                      score: predictions.sochScenario.requiredScore,
                      max: predictions.sochScenario.maxScore || sochMaxScore,
                      percent: predictions.sochScenario.requiredPercent,
                    })
                  : predictions.sochScenario.isPossible
                    ? t("predictor.scenarios.soch_possible", {
                        grade: targetGrade,
                        percent: predictions.sochScenario.requiredPercent,
                      })
                    : t("predictor.scenarios.soch_impossible", {
                        grade: targetGrade,
                        max: predictions.sochScenario.maxScore || sochMaxScore,
                      })}
            </p>
          </ScenarioCard>
        )}

        <ScenarioCard
          icon={SCENARIOS.FO.icon}
          title={t("predictor.scenarios.through_fo")}
        >
          <p className={styles.content}>
            {predictions.foScenario.isPossible &&
            predictions.foScenario.needed10s > 0
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
