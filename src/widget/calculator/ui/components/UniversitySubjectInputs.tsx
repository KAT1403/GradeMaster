import type { ChangeEvent, KeyboardEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAcademicRecordStore } from "../../../../entities/academic-record/model/store";
import { Card } from "../../../../shared/ui/card";
import { Input } from "../../../../shared/ui/input/ui/Input";
import { KAZ_UNIVERSITY_SCALE } from "../../../../shared/lib/converters";
import styles from "../CalculatorWidget.module.scss";

interface UniversitySubjectInputsProps {
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

const getUniGradeColors = (letter: string) => {
  if (["A", "A-", "B+", "B", "B-"].includes(letter)) {
    return {
      bg: "#3b8f21",
      text: "#ffffff",
      border: "#3b8f21",
      solid: "#3b8f21",
    };
  }
  if (["C+", "C", "C-", "D+", "D"].includes(letter)) {
    return {
      bg: "#ff8e12",
      text: "#ffffff",
      border: "#ff8e12",
      solid: "#ff8e12",
    };
  }
  return {
    bg: "#d13142",
    text: "#ffffff",
    border: "#d13142",
    solid: "#d13142",
  };
};

export const UniversitySubjectInputs = ({
  handleKeyDown,
}: UniversitySubjectInputsProps) => {
  const { t } = useTranslation();
  const {
    uniMidterm1,
    uniMidterm2,
    uniExam,
    setUniMidterm1,
    setUniMidterm2,
    setUniExam,
  } = useAcademicRecordStore();

  const [isPredictorExpanded, setIsPredictorExpanded] = useState(false);

  const rd =
    uniMidterm1 !== null || uniMidterm2 !== null
      ? ((uniMidterm1 ?? 0) + (uniMidterm2 ?? 0)) /
        ((uniMidterm1 !== null ? 1 : 0) + (uniMidterm2 !== null ? 1 : 0))
      : 0;
  const isAllowed = rd >= 50;

  return (
    <div className={styles.uniInputsContainer}>
      <Card className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>
          {t("calculator.uni_tab_subject")}
        </h3>
        <div className={styles.uniFormGrid}>
          <div className={styles.uniField}>
            <label className={styles.uniLabel}>
              {t("calculator.uni_rating1")} (0-100)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="0-100"
              value={uniMidterm1 ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const val =
                  e.target.value === ""
                    ? null
                    : Math.max(
                        0,
                        Math.min(100, parseFloat(e.target.value) || 0),
                      );
                setUniMidterm1(val);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className={styles.uniField}>
            <label className={styles.uniLabel}>
              {t("calculator.uni_rating2")} (0-100)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="0-100"
              value={uniMidterm2 ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const val =
                  e.target.value === ""
                    ? null
                    : Math.max(
                        0,
                        Math.min(100, parseFloat(e.target.value) || 0),
                      );
                setUniMidterm2(val);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className={styles.uniField}>
            <label
              className={`${styles.uniLabel} ${!isAllowed ? styles.uniLabelDisabled : ""}`}
            >
              {t("calculator.uni_exam")} (0-100)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder={isAllowed ? "0-100" : t("calculator.uni_exam_blocked")}
              value={uniExam ?? ""}
              disabled={!isAllowed}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const val =
                  e.target.value === ""
                    ? null
                    : Math.max(
                        0,
                        Math.min(100, parseFloat(e.target.value) || 0),
                      );
                setUniExam(val);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>

          {!isAllowed && (uniMidterm1 !== null || uniMidterm2 !== null) && (
            <div className={styles.uniAlertBadge}>
              {t("calculator.uni_status_not_allowed")}
            </div>
          )}
        </div>
      </Card>

      {uniExam === null &&
        isAllowed &&
        (uniMidterm1 !== null || uniMidterm2 !== null) && (
          <Card className={styles.uniPredictorCard}>
            <h4 className={styles.uniPredictorTitle}>{t("predictor.title")}</h4>
            <div className={styles.uniPredictorList}>
              {(() => {
                const targetScales = KAZ_UNIVERSITY_SCALE.filter(
                  (item) => item.letter !== "FX" && item.letter !== "F",
                );
                const visibleScales = isPredictorExpanded
                  ? targetScales
                  : targetScales.slice(0, 3);
                return visibleScales.map((item) => {
                  const targetMin = item.min;
                  const neededExamScore = Math.ceil(
                    (targetMin - rd * 0.6) / 0.4,
                  );
                  let desc = "";
                  if (neededExamScore > 100) {
                    desc = t("calculator.uni_predictor_impossible", {
                      grade: item.letter,
                    });
                  } else if (neededExamScore <= 0) {
                    desc = t("calculator.uni_predictor_achieved");
                  } else {
                    desc = t("calculator.uni_predictor_needed", {
                      grade: item.letter,
                      score: neededExamScore,
                    });
                  }
                  return (
                    <div key={item.letter} className={styles.uniPredictorItem}>
                      <span
                        className={styles.uniPredictorLetter}
                        style={{
                          color: getUniGradeColors(item.letter).solid,
                        }}
                      >
                        {item.letter} (GPA: {item.gpa.toFixed(2)})
                      </span>
                      <span className={styles.uniPredictorDesc}>{desc}</span>
                    </div>
                  );
                });
              })()}
            </div>
            <button
              type="button"
              className={styles.uniPredictorExpandBtn}
              onClick={() => setIsPredictorExpanded(!isPredictorExpanded)}
            >
              {isPredictorExpanded
                ? t("calculator.collapse")
                : t("calculator.show_all_targets")}
            </button>
            <div className={styles.uniB2BAlert}>
              {t("calculator.uni_b2b_alert")}
            </div>
          </Card>
        )}
    </div>
  );
};
