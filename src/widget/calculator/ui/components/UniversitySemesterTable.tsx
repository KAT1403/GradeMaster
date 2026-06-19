import type { ChangeEvent, FocusEvent } from "react";
import { useTranslation } from "react-i18next";
import { useAcademicRecordStore } from "../../../../entities/academic-record/model/store";
import { Card } from "../../../../shared/ui/card";
import { Input } from "../../../../shared/ui/input/ui/Input";
import { ECTS_VALUES } from "../../../../shared/lib/converters";
import { Trash2 } from "lucide-react";
import styles from "../CalculatorWidget.module.scss";

export const UniversitySemesterTable = () => {
  const { t } = useTranslation();
  const {
    semesterSubjects,
    addSemesterSubject,
    removeSemesterSubject,
    updateSemesterSubject,
  } = useAcademicRecordStore();

  const totalPoints = semesterSubjects.reduce(
    (sum, sub) => sum + (ECTS_VALUES[sub.letter] || 0) * sub.credits,
    0,
  );
  const totalCredits = semesterSubjects.reduce(
    (sum, sub) => sum + sub.credits,
    0,
  );
  const semesterGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return (
    <div className={styles.uniInputsContainer}>
      <Card className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>
          {t("calculator.uni_tab_semester")}
        </h3>
        <div className={styles.uniTableScrollContainer}>
          <table className={styles.uniTable}>
            <thead>
              <tr>
                <th>{t("calculator.uni_subject_placeholder")}</th>
                <th>{t("calculator.uni_credits")}</th>
                <th>{t("calculator.uni_grade_header")}</th>
                <th style={{ textAlign: "center" }}>
                  {t("calculator.uni_action_header")}
                </th>
              </tr>
            </thead>
            <tbody>
              {semesterSubjects.map((sub) => (
                <tr key={sub.id}>
                  <td data-label={t("calculator.uni_subject_placeholder")}>
                    <Input
                      type="text"
                      value={sub.title}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateSemesterSubject(sub.id, "title", e.target.value)
                      }
                      className={styles.uniSubjectInput}
                      placeholder={t("calculator.uni_subject_placeholder")}
                    />
                  </td>
                  <td data-label={t("calculator.uni_credits")}>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      step={1}
                      value={sub.credits || ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const val = parseInt(e.target.value, 10);
                        if (isNaN(val)) {
                          updateSemesterSubject(sub.id, "credits", 0);
                        } else {
                          updateSemesterSubject(
                            sub.id,
                            "credits",
                            Math.min(30, Math.max(0, val)),
                          );
                        }
                      }}
                      onBlur={(e: FocusEvent<HTMLInputElement>) => {
                        const val = parseInt(e.target.value, 10);
                        const constrained =
                          isNaN(val) || val < 1
                            ? 3
                            : Math.min(30, Math.max(1, val));
                        updateSemesterSubject(sub.id, "credits", constrained);
                      }}
                      className={styles.uniSubjectInput}
                    />
                  </td>
                  <td data-label={t("calculator.uni_grade_header")}>
                    <select
                      value={sub.letter}
                      onChange={(e) =>
                        updateSemesterSubject(sub.id, "letter", e.target.value)
                      }
                      className={styles.uniSelect}
                    >
                      {Object.keys(ECTS_VALUES).map((letter) => (
                        <option key={letter} value={letter}>
                          {letter} ({ECTS_VALUES[letter].toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={styles.uniDeleteCell}>
                    <button
                      type="button"
                      onClick={() => removeSemesterSubject(sub.id)}
                      className={styles.uniDeleteBtn}
                      aria-label={t("calculator.uni_remove_subject")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                  <td className={styles.uniDeleteRowCell}>
                    <button
                      type="button"
                      onClick={() => removeSemesterSubject(sub.id)}
                      className={styles.uniDeleteRowBtn}
                    >
                      <Trash2 size={15} />
                      {t("calculator.uni_remove_subject")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={addSemesterSubject}
          className={styles.uniAddBtn}
        >
          {t("calculator.uni_add_subject")}
        </button>

        <div className={styles.uniExplanation}>
          <h4>{t("calculator.uni_gpa_math")}</h4>
          <p>
            {t("calculator.uni_gpa_explanation", {
              points: totalPoints.toFixed(2),
              credits: totalCredits,
              gpa: semesterGPA.toFixed(2),
            })}
          </p>
        </div>
      </Card>
    </div>
  );
};
