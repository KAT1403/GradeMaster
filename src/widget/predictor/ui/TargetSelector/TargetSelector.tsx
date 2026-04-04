import { useTranslation } from "react-i18next";
import { Card } from "../../../../shared/ui/card";
import { GRADE_OPTIONS } from "../../model/constants";
import type { TargetSelectorProps } from "../../model/types";
import styles from "./TargetSelector.module.scss";

export const TargetSelector = ({
  targetGrade,
  onTargetChange,
}: TargetSelectorProps) => {
  const { t } = useTranslation();

  return (
    <Card className={styles.container}>
      <div className={styles.selector}>
        {GRADE_OPTIONS.map((grade) => (
          <button
            key={grade}
            className={`${styles.button} ${targetGrade === grade ? styles.active : ""}`}
            onClick={() => onTargetChange(grade)}
          >
            {t("predictor.target_grade")}: {grade}
          </button>
        ))}
      </div>
    </Card>
  );
};
