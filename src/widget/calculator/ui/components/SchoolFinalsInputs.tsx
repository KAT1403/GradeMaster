import { useTranslation } from "react-i18next";
import { useAcademicRecordStore } from "../../../../entities/academic-record/model/store";
import { Card } from "../../../../shared/ui/card";
import { getGradeColors } from "../../../../shared/lib/grading";
import styles from "../CalculatorWidget.module.scss";

export const SchoolFinalsInputs = () => {
  const { t } = useTranslation();
  const {
    finalQ1,
    finalQ2,
    finalQ3,
    finalQ4,
    finalExam,
    setFinalQ1,
    setFinalQ2,
    setFinalQ3,
    setFinalQ4,
    setFinalExam,
  } = useAcademicRecordStore();

  const quartersList = [
    { label: t("calculator.quarter_1"), val: finalQ1, setter: setFinalQ1 },
    { label: t("calculator.quarter_2"), val: finalQ2, setter: setFinalQ2 },
    { label: t("calculator.quarter_3"), val: finalQ3, setter: setFinalQ3 },
    { label: t("calculator.quarter_4"), val: finalQ4, setter: setFinalQ4 },
  ];

  return (
    <div className={styles.finalGradesContainer}>
      {quartersList.map((quarter, idx) => (
        <Card key={idx} className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>{quarter.label}</h3>
          <div className={styles.finalGradeSelector}>
            {[2, 3, 4, 5].map((grade) => {
              const active = quarter.val === grade;
              const colors = getGradeColors(grade);
              return (
                <button
                  key={grade}
                  className={`${styles.finalGradeBtn} ${active ? styles.active : ""}`}
                  style={
                    active
                      ? {
                          backgroundColor: colors.solid,
                          borderColor: colors.solid,
                          color: "#ffffff",
                        }
                      : {}
                  }
                  onClick={() =>
                    quarter.setter(quarter.val === grade ? null : grade)
                  }
                >
                  {grade}
                </button>
              );
            })}
          </div>
        </Card>
      ))}

      <Card className={`${styles.sectionCard} ${styles.examCard}`}>
        <h3 className={styles.sectionTitle}>{t("calculator.exam_optional")}</h3>
        <div className={styles.finalGradeSelector}>
          {[2, 3, 4, 5].map((grade) => {
            const active = finalExam === grade;
            const colors = getGradeColors(grade);
            return (
              <button
                key={grade}
                className={`${styles.finalGradeBtn} ${active ? styles.active : ""}`}
                style={
                  active
                    ? {
                        backgroundColor: colors.solid,
                        borderColor: colors.solid,
                        color: "#ffffff",
                      }
                    : {}
                }
                onClick={() => setFinalExam(finalExam === grade ? null : grade)}
              >
                {grade}
              </button>
            );
          })}
          <button
            className={`${styles.finalGradeBtn} ${styles.clearBtn} ${finalExam === null ? styles.activeClear : ""}`}
            onClick={() => setFinalExam(null)}
          >
            {t("calculator.no_exam")}
          </button>
        </div>
      </Card>
    </div>
  );
};
