import { useTranslation } from "react-i18next";
import { Card } from "../../../../shared/ui/card";
import { ProgressBar } from "../../../../shared/ui/ProgressBar";
import { KAZ_UNIVERSITY_SCALE } from "../../../../shared/lib/converters";
import styles from "../CalculatorWidget.module.scss";

const getNextUniGradeInfo = (percent: number) => {
  const rounded = Math.round(percent * 10) / 10;
  const activeIndex = KAZ_UNIVERSITY_SCALE.findIndex(
    (item) => rounded >= item.min && rounded <= item.max,
  );
  if (activeIndex <= 0) {
    return { nextGrade: null, remaining: 0 };
  }
  const nextItem = KAZ_UNIVERSITY_SCALE[activeIndex - 1];
  return {
    nextGrade: nextItem.letter,
    remaining: nextItem.min - percent,
  };
};

interface ResultCardProps {
  selectedSystem: "bilim_class" | "kundelik" | "university" | "final";
  uniSubMode: "subject" | "semester";
  semesterGPA: number;
  semesterGPALetter: string;
  semesterGPAColor: { solid: string };
  totalCredits: number;
  currentGradeColors: { solid: string };
  currentPercent: number;
  currentGrade: number;
  nextGradeInfo: { nextGrade: number | null; remaining: number };
  intlGPA: { score: number; letter: string };
  isAllowed: boolean;
  finalGradeScore: number;
  quartersLength: number;
  uniMidterm1: number | null;
  uniMidterm2: number | null;
  uniExam: number | null;
  finalQ1: number | null;
  finalQ2: number | null;
  finalQ3: number | null;
  finalQ4: number | null;
  finalExam: number | null;
}

export const ResultCard = ({
  selectedSystem,
  uniSubMode,
  semesterGPA,
  semesterGPALetter,
  semesterGPAColor,
  totalCredits,
  currentGradeColors,
  currentPercent,
  currentGrade,
  nextGradeInfo,
  intlGPA,
  isAllowed,
  finalGradeScore,
  quartersLength,
  uniMidterm1,
  uniMidterm2,
  uniExam,
  finalQ1,
  finalQ2,
  finalQ3,
  finalQ4,
  finalExam,
}: ResultCardProps) => {
  const { t } = useTranslation();

  if (selectedSystem === "university" && uniSubMode === "semester") {
    return (
      <Card className={styles.resultCard}>
        <div className={styles.resultHeader}>
          <span className={styles.resultTitle}>
            {t("calculator.uni_gpa_forecast")}
          </span>
          <div
            className={styles.gradeBadge}
            style={{ backgroundColor: semesterGPAColor.solid }}
          >
            {semesterGPALetter}
          </div>
        </div>
        <div className={styles.percentDisplay}>{semesterGPA.toFixed(2)}</div>
        <div className={styles.progressSection}>
          <ProgressBar
            value={semesterGPA}
            max={4}
            variant={
              semesterGPA >= 2.67
                ? "high"
                : semesterGPA >= 1.0
                  ? "medium"
                  : "low"
            }
          />
          <span className={styles.progressText}>
            {t("calculator.uni_credits")}: {totalCredits}
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.resultCard}>
      <div className={styles.resultHeader}>
        <span className={styles.resultTitle}>
          {selectedSystem === "university"
            ? t("calculator.uni_grade_title")
            : selectedSystem === "final"
              ? t("calculator.final_grade_title")
              : t("calculator.total_percent")}
        </span>
        <div
          className={styles.gradeBadge}
          style={{ backgroundColor: currentGradeColors.solid }}
        >
          {selectedSystem === "university"
            ? uniMidterm1 !== null || uniMidterm2 !== null
              ? intlGPA.letter
              : "-"
            : currentGrade || "-"}
        </div>
      </div>

      <div className={styles.percentDisplay}>
        {selectedSystem === "university"
          ? `${uniMidterm1 !== null || uniMidterm2 !== null || uniExam !== null ? currentPercent.toFixed(1) : "0.0"}%`
          : selectedSystem === "final"
            ? quartersLength > 0
              ? `${finalGradeScore.toFixed(2)}`
              : "0.00"
            : `${currentPercent.toFixed(selectedSystem === "kundelik" ? 2 : 1)}%`}
      </div>

      {selectedSystem === "university" ? (
        <div className={styles.uniStatsGrid}>
          <div className={styles.uniStatChip}>
            GPA: {intlGPA.score.toFixed(2)}
          </div>
          {(uniMidterm1 !== null || uniMidterm2 !== null) &&
            (!isAllowed || uniExam === null) && (
              <div
                className={`${styles.uniStatChip} ${isAllowed ? styles.uniStatChipSuccess : styles.uniStatChipDanger}`}
              >
                {isAllowed
                  ? t("calculator.uni_status_allowed")
                  : t("calculator.uni_status_not_allowed")}
              </div>
            )}
        </div>
      ) : (
        <div className={styles.gpaSimple}>
          {selectedSystem === "final"
            ? t("calculator.final_gpa_details", {
                gpa: intlGPA.score.toFixed(2),
                letter: intlGPA.letter,
                q1: finalQ1 || "-",
                q2: finalQ2 || "-",
                q3: finalQ3 || "-",
                q4: finalQ4 || "-",
                exam: finalExam || "-",
              })
            : t("calculator.simple_gpa_details", {
                gpa: intlGPA.score.toFixed(2),
                letter: intlGPA.letter,
              })}
        </div>
      )}

      {selectedSystem !== "final" && (
        <div className={styles.progressSection}>
          <ProgressBar
            value={currentPercent}
            variant={
              selectedSystem === "university"
                ? currentPercent >= 50
                  ? "high"
                  : "low"
                : currentGrade > 0
                  ? "high"
                  : "low"
            }
          />
          {selectedSystem === "university" ? (
            (() => {
              const hasInputs =
                uniMidterm1 !== null ||
                uniMidterm2 !== null ||
                uniExam !== null;
              if (!hasInputs) {
                return (
                  <span className={styles.progressText}>
                    {t("calculator.add_at_least_one")}
                  </span>
                );
              }
              const nextUniInfo = getNextUniGradeInfo(currentPercent);
              if (nextUniInfo.nextGrade) {
                return (
                  <span className={styles.progressText}>
                    {t("calculator.to_next_grade")} {nextUniInfo.nextGrade}:{" "}
                    {nextUniInfo.remaining.toFixed(1)}%
                  </span>
                );
              } else {
                return (
                  <span className={styles.progressText}>
                    {t("calculator.max_points_reached")}
                  </span>
                );
              }
            })()
          ) : currentGrade > 0 ? (
            nextGradeInfo.nextGrade ? (
              <span className={styles.progressText}>
                {t("calculator.to_next_grade")} {nextGradeInfo.nextGrade}:{" "}
                {nextGradeInfo.remaining.toFixed(1)}%
              </span>
            ) : (
              <span className={styles.progressText}>
                {currentPercent >= 100
                  ? t("calculator.max_points_reached")
                  : t("calculator.grade_5_reached")}
              </span>
            )
          ) : (
            <span className={styles.progressText}>
              {t("calculator.add_at_least_one")}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
