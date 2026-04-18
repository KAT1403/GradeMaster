import type { ChangeEvent, KeyboardEvent } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAcademicRecordStore } from "../../../entities/academic-record/model/store";
import { useHistoryManager } from "../../../features/history/model/store";
import { SaveModal } from "../../../features/history/ui/SaveModal";
import { ResetConfirmModal } from "../../../features/history/ui/ResetConfirmModal";
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
import { calculateIntlGPA } from "../../../shared/lib/converters";
import styles from "./CalculatorWidget.module.scss";

export const CalculatorWidget = () => {
  const { t } = useTranslation();
  const { fos, sors, soch, activeRecordId, addFO, removeFO, updateSOR, setSOCH, resetAll } =
    useAcademicRecordStore();
  const { entries } = useHistoryManager();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetAfterSave, setResetAfterSave] = useState(false);

  const isFormEmpty = fos.length === 0 && 
    sors.every((s) => (s.score || 0) === 0 && (s.max || 0) === 0) && 
    (!soch || ((soch.score || 0) === 0 && (soch.max || 0) === 0));

  let hasUnsavedChanges = false;
  if (activeRecordId) {
    const activeEntry = entries.find(e => e.id === activeRecordId);
    if (activeEntry) {
      const currentData = { 
        fos, 
        sors: sors.map(s => ({ score: s.score || 0, max: s.max || 0 })), 
        soch: soch ? { score: soch.score || 0, max: soch.max || 0 } : null 
      };
      const savedData = {
        fos: activeEntry.data.fos,
        sors: activeEntry.data.sors.map(s => ({ score: s.score || 0, max: s.max || 0 })),
        soch: activeEntry.data.soch ? { score: activeEntry.data.soch.score || 0, max: activeEntry.data.soch.max || 0 } : null
      };
      hasUnsavedChanges = JSON.stringify(currentData) !== JSON.stringify(savedData);
    } else {
      hasUnsavedChanges = !isFormEmpty;
    }
  } else {
    hasUnsavedChanges = !isFormEmpty;
  }

  const handleResetClick = () => {
    if (hasUnsavedChanges) {
      setIsResetModalOpen(true);
    } else {
      resetAll();
    }
  };

  const handleConfirmSaveBeforeReset = () => {
    setIsResetModalOpen(false);
    setResetAfterSave(true);
    setIsSaveModalOpen(true);
  };

  const handleDiscardAndReset = () => {
    setIsResetModalOpen(false);
    resetAll();
  };

  const handleSaveModalClose = () => {
    setIsSaveModalOpen(false);
    setResetAfterSave(false);
  };

  const handleSaveComplete = () => {
    if (resetAfterSave) {
      resetAll();
      setResetAfterSave(false);
    }
  };

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
    } else if (["e", "E", "+", "-"].includes(e.key)) {
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

  const MAX_POINTS = 100;

  const sanitizeValue = (val: number) => {
    if (isNaN(val)) return 0;
    return Math.max(0, Math.min(MAX_POINTS, val));
  };

  const handleSorChange = (
    id: string,
    field: "score" | "max",
    rawValue: string,
  ) => {
    const num = parseFloat(rawValue);
    const val = sanitizeValue(num);
    const sor = sors.find((s) => s.id === id);
    if (!sor) return;

    if (field === "max") {
      updateSOR(id, { ...sor, max: val });
    } else {
      updateSOR(id, { ...sor, score: val });
    }
  };

  const handleSochChange = (field: "score" | "max", rawValue: string) => {
    const num = parseFloat(rawValue);
    const val = sanitizeValue(num);
    
    setSOCH({
      score: field === "score" ? val : soch?.score || 0,
      max: field === "max" ? val : soch?.max || 0,
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
                      min="0"
                      max={MAX_POINTS}
                      placeholder={t("calculator.sor_score")}
                      value={sor.score || ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleSorChange(sor.id, "score", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      className={styles.numInput}
                      style={customInputStyle}
                    />
                    <span className={styles.divider}>/</span>
                    <Input
                      type="number"
                      min="0"
                      max={MAX_POINTS}
                      placeholder={t("calculator.sor_max")}
                      value={sor.max || ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleSorChange(sor.id, "max", e.target.value)
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
                    min="0"
                    max={MAX_POINTS}
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
                    min="0"
                    max={MAX_POINTS}
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

      <div className={styles.bottomButtons}>
        <button 
          className={`${styles.saveBtn} ${!hasUnsavedChanges ? styles.disabled : ""}`} 
          onClick={() => setIsSaveModalOpen(true)}
          disabled={!hasUnsavedChanges}
        >
          {t("history.save_btn")}
        </button>
        <button className={styles.resetBtn} onClick={handleResetClick}>
          {t("calculator.reset")}
        </button>
      </div>

      <SaveModal 
        isOpen={isSaveModalOpen} 
        onClose={handleSaveModalClose} 
        onSaveComplete={handleSaveComplete} 
      />
      <ResetConfirmModal 
        isOpen={isResetModalOpen} 
        onConfirmSave={handleConfirmSaveBeforeReset} 
        onConfirmDiscard={handleDiscardAndReset} 
        onCancel={() => setIsResetModalOpen(false)} 
      />
    </div>
  );
};
