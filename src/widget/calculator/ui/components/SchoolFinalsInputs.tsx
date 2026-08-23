import { useTranslation } from "react-i18next";
import { useAcademicRecordStore } from "../../../../entities/academic-record/model/store";
import { Card } from "../../../../shared/ui/card";
import { calculateSchoolFinalSummary } from "../../../../shared/lib/grading";
import { Trash2 } from "lucide-react";
import styles from "../CalculatorWidget.module.scss";

const SCHOOL_SUBJECT_OPTIONS = [
  "Алгебра",
  "Русский язык",
  "Казахский язык",
  "Английский язык",
  "Физика",
  "Химия",
  "Биология",
  "География",
  "История Казахстана",
  "История",
  "Литература",
  "Информатика",
];

export const SchoolFinalsInputs = () => {
  const { t } = useTranslation();
  const {
    schoolFinalSubjects,
    addSchoolFinalSubject,
    removeSchoolFinalSubject,
    updateSchoolFinalSubject,
  } = useAcademicRecordStore();

  const summary = calculateSchoolFinalSummary(schoolFinalSubjects);

  return (
    <div className={styles.uniInputsContainer}>
      <Card className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>{t("calculator.final_school_title")}</h3>

        <div className={styles.uniTableScrollContainer}>
          <table className={styles.uniTable}>
            <thead>
              <tr>
                <th>{t("calculator.uni_subject_placeholder")}</th>
                <th>{t("calculator.school_grade_year")}</th>
                <th>{t("calculator.uni_grade_header")}</th>
                <th style={{ textAlign: "center" }}>
                  {t("calculator.uni_action_header")}
                </th>
              </tr>
            </thead>
            <tbody>
              {schoolFinalSubjects.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className={styles.emptyText}>{t("calculator.no_grades")}</div>
                  </td>
                </tr>
              ) : (
                schoolFinalSubjects.map((subject) => (
                  <tr key={subject.id}>
                    <td data-label={t("calculator.uni_subject_placeholder")}>
                      <select
                        value={subject.title || ""}
                        onChange={(e) =>
                          updateSchoolFinalSubject(
                            subject.id,
                            "title",
                            e.target.value,
                          )
                        }
                        className={styles.uniSelect}
                      >
                        <option value="">{t("calculator.uni_subject_placeholder")}</option>
                        {SCHOOL_SUBJECT_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td data-label={t("calculator.school_grade_year")}>
                      <select
                        value={subject.year}
                        onChange={(e) =>
                          updateSchoolFinalSubject(
                            subject.id,
                            "year",
                            Number(e.target.value),
                          )
                        }
                        className={styles.uniSelect}
                      >
                        {[5, 6, 7, 8, 9, 10, 11].map((year) => (
                          <option key={year} value={year}>
                            {year} {t("calculator.school_year_short")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td data-label={t("calculator.uni_grade_header")}>
                      <select
                        value={subject.grade ?? ""}
                        onChange={(e) =>
                          updateSchoolFinalSubject(
                            subject.id,
                            "grade",
                            e.target.value === "" ? null : Number(e.target.value),
                          )
                        }
                        className={styles.uniSelect}
                      >
                        <option value="">—</option>
                        {[2, 3, 4, 5].map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={styles.uniDeleteCell}>
                      <button
                        type="button"
                        onClick={() => removeSchoolFinalSubject(subject.id)}
                        className={styles.uniDeleteBtn}
                        aria-label={t("calculator.uni_remove_subject")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                    <td className={styles.uniDeleteRowCell}>
                      <button
                        type="button"
                        onClick={() => removeSchoolFinalSubject(subject.id)}
                        className={styles.uniDeleteRowBtn}
                      >
                        <Trash2 size={15} />
                        {t("calculator.uni_remove_subject")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={() => addSchoolFinalSubject()}
          className={styles.uniAddBtn}
        >
          {t("calculator.uni_add_subject")}
        </button>

        <div className={styles.uniExplanation}>
          <h4>{t("calculator.school_final_summary_title")}</h4>
          <p>
            {summary.filledSubjects > 0
              ? t("calculator.school_final_summary", {
                  avg: summary.averageGrade.toFixed(2),
                  gpa: summary.gpa.toFixed(2),
                  letter: summary.letter,
                  count: summary.filledSubjects,
                })
              : t("calculator.school_final_empty")}
          </p>
        </div>
      </Card>
    </div>
  );
};
