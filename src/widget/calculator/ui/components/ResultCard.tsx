import { useTranslation } from "react-i18next";
import { useAcademicRecordStore } from "../../../../entities/academic-record/model/store";
import {
  getRecordPercent,
  isSemesterRecord,
} from "../../../../entities/academic-record/lib/record";
import { Card } from "../../../../shared/ui/card";
import { ProgressBar } from "../../../../shared/ui/ProgressBar";
import {
  KAZ_UNIVERSITY_SCALE,
  calculateIntlGPA,
} from "../../../../shared/lib/converters";
import {
  calculateAdmissionRating,
  calculateFinalScore,
  calculateSemesterSummary,
  getGradeColors,
  getGradeFromPercent,
  getNextGradeInfo,
  getUniGradeColors,
  isExamAllowed,
} from "../../../../shared/lib/grading";
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

const SemesterResultCard = () => {
  const { t } = useTranslation();
  const semesterSubjects = useAcademicRecordStore(
    (state) => state.semesterSubjects,
  );
  const { semesterGPA, semesterGPALetter, totalCredits } =
    calculateSemesterSummary(semesterSubjects);
  const badgeColor =
    totalCredits > 0
      ? getUniGradeColors(semesterGPALetter).solid
      : "var(--accent-primary)";

  return (
    <Card className={styles.resultCard}>
      <div className={styles.resultHeader}>
        <span className={styles.resultTitle}>
          {t("calculator.uni_gpa_forecast")}
        </span>
        <div
          className={styles.gradeBadge}
          style={{ backgroundColor: badgeColor }}
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
            semesterGPA >= 2.67 ? "high" : semesterGPA >= 1.0 ? "medium" : "low"
          }
        />
        <span className={styles.progressText}>
          {t("calculator.uni_credits")}: {totalCredits}
        </span>
      </div>
    </Card>
  );
};

export const ResultCard = () => {
  const { t } = useTranslation();
  const record = useAcademicRecordStore();

  if (isSemesterRecord(record)) {
    return <SemesterResultCard />;
  }

  const {
    selectedSystem,
    finalQ1,
    finalQ2,
    finalQ3,
    finalQ4,
    finalExam,
    uniMidterm1,
    uniMidterm2,
    uniExam,
  } = record;

  const currentPercent = getRecordPercent(record);
  const { score: finalGradeScore, filledQuarters } = calculateFinalScore(record);
  const hasGradedInput =
    record.fos.length > 0 ||
    record.sors.some((sor) => sor.max !== null && sor.max > 0) ||
    Boolean(record.soch?.max);

  const currentGrade =
    selectedSystem === "final"
      ? filledQuarters > 0
        ? Math.round(finalGradeScore)
        : 0
      : currentPercent === 0 && !hasGradedInput
        ? 0
        : getGradeFromPercent(currentPercent);

  const nextGradeInfo = getNextGradeInfo(currentPercent);
  const intlGPA = calculateIntlGPA(currentPercent);
  const currentGradeColors =
    selectedSystem === "university"
      ? getUniGradeColors(intlGPA.letter)
      : getGradeColors(currentGrade);
  const isAllowed = isExamAllowed(
    calculateAdmissionRating(uniMidterm1, uniMidterm2),
  );
  const hasUniInputs =
    uniMidterm1 !== null || uniMidterm2 !== null || uniExam !== null;
  const nextUniInfo = getNextUniGradeInfo(currentPercent);

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
          ? `${hasUniInputs ? currentPercent.toFixed(1) : "0"}%`
          : selectedSystem === "final"
            ? filledQuarters > 0
              ? `${finalGradeScore.toFixed(2)}`
              : "0"
            : `${Math.round(currentPercent)}%`}
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
            <span className={styles.progressText}>
              {!hasUniInputs
                ? t("calculator.add_at_least_one")
                : nextUniInfo.nextGrade
                  ? `${t("calculator.to_next_grade")} ${nextUniInfo.nextGrade}: ${nextUniInfo.remaining.toFixed(1)}%`
                  : t("calculator.max_points_reached")}
            </span>
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
