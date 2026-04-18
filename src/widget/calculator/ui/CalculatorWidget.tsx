import type { ChangeEvent, KeyboardEvent } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAcademicRecordStore } from "../../../entities/academic-record/model/store";
import {
  calculateTotalPercent,
  getGradeFromPercent,
  getNextGradeInfo,
  getGradeColors,
  getFoColor,
  getScoreColor,
} from "../../../shared/lib/grading";
import { Card } from "../../../shared/ui/card";
import { DigitalNumpad } from "../../../shared/ui/digital-numpad";
import { Input } from "../../../shared/ui/input/ui/Input";
import { ProgressBar } from "../../../shared/ui/ProgressBar";
import {
  calculateIntlGPA,
} from "../../../shared/lib/converters";
import styles from "./CalculatorWidget.module.scss";


export const CalculatorWidget = () => {
  const { t } = useTranslation();
  const { fos, sors, soch, addFO, removeFO, updateSOR, setSOCH, resetAll } =
    useAcademicRecordStore();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!wrapperRef.current) return;
    const inputs = Array.from(wrapperRef.current.querySelectorAll("input"));
    const currentIndex = inputs.indexOf(e.currentTarget);
    if (currentIndex === -1) return;

    if (e.key === "Enter") {
      e.preventDefault();
      if (currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
      } else {
        e.currentTarget.blur();
      }
    } else if (e.key === "Backspace") {
      if (e.currentTarget.value === "") {
        e.preventDefault();
        if (currentIndex > 0) {
          const prevInput = inputs[currentIndex - 1];
          prevInput.focus();

          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value",
          )?.set;
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(prevInput, "");
            prevInput.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
      }
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
    }
  };

  const currentPercent = calculateTotalPercent({ fos, sors, soch });
  const currentGrade =
    currentPercent === 0 &&
    fos.length === 0 &&
    sors.filter((s) => s.max > 0).length === 0 &&
    !soch?.max
      ? 0
      : getGradeFromPercent(currentPercent);
  const nextGradeInfo = getNextGradeInfo(currentPercent);

  const handleSochChange = (field: "score" | "max", value: string) => {
    const num = parseFloat(value);
    setSOCH({
      score: field === "score" ? (isNaN(num) ? 0 : num) : soch?.score || 0,
      max: field === "max" ? (isNaN(num) ? 0 : num) : soch?.max || 0,
    });
  };

  const currentGradeColors = getGradeColors(currentGrade);

  const intlGPA = calculateIntlGPA(currentPercent);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <Card className={styles.resultCard}>
        <div className={styles.resultHeader}>
          <span className={styles.resultTitle}>
            {t("calculator.total_percent")}
          </span>
          <div
            className={styles.gradeBadge}
            style={{ backgroundColor: currentGradeColors.solid }}
          >
            {currentGrade || "-"}
          </div>
        </div>

        <div className={styles.percentDisplay}>
          {currentPercent.toFixed(1)}%
        </div>

        <div className={styles.gpaSimple}>
          {t("calculator.gpa")}: {intlGPA.score.toFixed(2)} ({intlGPA.letter})
        </div>

        <div className={styles.progressSection}>
          <ProgressBar
            value={currentPercent}
            variant={currentGrade > 0 ? "high" : "low"}
          />
          {currentGrade > 0 ? (
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
      </Card>

      <Card className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>{t("calculator.sor_title")}</h3>
        </div>
        <div className={styles.sorList}>
          {sors.map((sor, index) => {
            const sorColors = getScoreColor(sor.score, sor.max);
            const customInputStyle =
              sor.max > 0
                ? {
                    backgroundColor: sorColors.bg,
                    color: sorColors.text,
                    borderColor: sorColors.border,
                  }
                : {};
            return (
              <div key={sor.id} className={styles.sorRow}>
                <span className={styles.sorIndex}>
                  {t("calculator.sor_short")} {index + 1}
                </span>
                <div className={styles.inputsWrapper}>
                  <Input
                    type="number"
                    placeholder={t("calculator.sor_score")}
                    value={sor.score || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateSOR(sor.id, {
                        ...sor,
                        score: parseFloat(e.target.value) || 0,
                      })
                    }
                    onKeyDown={handleKeyDown}
                    className={styles.numInput}
                    style={customInputStyle}
                  />
                  <span className={styles.divider}>/</span>
                  <Input
                    type="number"
                    placeholder={t("calculator.sor_max")}
                    value={sor.max || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateSOR(sor.id, {
                        ...sor,
                        max: parseFloat(e.target.value) || 0,
                      })
                    }
                    onKeyDown={handleKeyDown}
                    className={styles.numInput}
                    style={customInputStyle}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className={styles.bottomGrid}>
        <Card className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>{t("calculator.fo_title")}</h3>
          <div className={styles.foChips}>
            {fos.length === 0 && (
              <span className={styles.emptyText}>
                {t("calculator.no_grades")}
              </span>
            )}
            {fos.map((fo, index) => {
              const foColors = getFoColor(fo);
              return (
                <div
                  key={index}
                  className={styles.chip}
                  onClick={() => removeFO(index)}
                  style={{
                    backgroundColor: foColors.bg,
                    color: foColors.text,
                    borderColor: foColors.border,
                  }}
                >
                  {fo}
                  <span className={styles.chipRemove}>&times;</span>
                </div>
              );
            })}
          </div>
          <DigitalNumpad onNumberClick={addFO} />
        </Card>

        <Card className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>{t("calculator.soch_title")}</h3>
          <div className={styles.sorRow}>
            {(() => {
              const sochColors = getScoreColor(
                soch?.score || 0,
                soch?.max || 0,
              );
              const customInputStyle =
                (soch?.max || 0) > 0
                  ? {
                      backgroundColor: sochColors.bg,
                      color: sochColors.text,
                      borderColor: sochColors.border,
                    }
                  : {};
              return (
                <div className={styles.inputsWrapper}>
                  <Input
                    type="number"
                    placeholder={t("calculator.sor_score")}
                    value={soch?.score || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleSochChange("score", e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    className={styles.numInput}
                    style={customInputStyle}
                  />
                  <span className={styles.divider}>/</span>
                  <Input
                    type="number"
                    placeholder={t("calculator.sor_max")}
                    value={soch?.max || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleSochChange("max", e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    className={styles.numInput}
                    style={customInputStyle}
                  />
                </div>
              );
            })()}
          </div>
        </Card>
      </div>

      <button className={styles.resetBtn} onClick={resetAll}>
        {t("calculator.reset")}
      </button>
    </div>
  );
};
