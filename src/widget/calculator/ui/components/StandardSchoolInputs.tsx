import type { ChangeEvent, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { useAcademicRecordStore } from "../../../../entities/academic-record/model/store";
import { Card } from "../../../../shared/ui/card";
import { Input } from "../../../../shared/ui/input/ui/Input";
import { DigitalNumpad } from "../../../../shared/ui/digital-numpad";
import { SmartPaste } from "../../../../features/smart-paste";
import {
  isScoreOverMax,
  isCompleteScore,
  getScoreColor,
  getFoColor,
} from "../../../../shared/lib/grading";
import styles from "../CalculatorWidget.module.scss";

interface StandardSchoolInputsProps {
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export const StandardSchoolInputs = ({
  handleKeyDown,
}: StandardSchoolInputsProps) => {
  const { t } = useTranslation();
  const { fos, sors, soch, addFO, removeFO, updateSOR, setSOCH } =
    useAcademicRecordStore();

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
    const sor = sors.find((s) => s.id === id);
    if (!sor) return;

    if (rawValue === "") {
      if (field === "max") {
        updateSOR(id, { ...sor, max: null });
      } else {
        updateSOR(id, { ...sor, score: null });
      }
    } else {
      if (rawValue.length > 1 && rawValue.startsWith("0")) {
        return;
      }

      const num = parseFloat(rawValue);
      if (isNaN(num)) return;
      if (!Number.isInteger(num)) return;
      const val = sanitizeValue(num);
      if (field === "max") {
        updateSOR(id, { ...sor, max: val });
      } else {
        updateSOR(id, { ...sor, score: val });
      }
    }
  };

  const handleSochChange = (field: "score" | "max", rawValue: string) => {
    if (rawValue === "") {
      if (field === "score") {
        setSOCH({
          score: null,
          max: soch?.max ?? null,
        });
      } else {
        setSOCH({
          score: soch?.score ?? null,
          max: null,
        });
      }
    } else {
      if (rawValue.length > 1 && rawValue.startsWith("0")) {
        return;
      }

      const num = parseFloat(rawValue);
      if (isNaN(num)) return;
      if (!Number.isInteger(num)) return;
      const val = sanitizeValue(num);
      if (field === "score") {
        setSOCH({
          score: val,
          max: soch?.max ?? null,
        });
      } else {
        setSOCH({
          score: soch?.score ?? null,
          max: val,
        });
      }
    }
  };

  return (
    <>
      <SmartPaste />

      <div className={styles.inputsGrid}>
        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>{t("calculator.sor_title")}</h3>
          </div>
          <div className={styles.sorList}>
            {sors.map((sor, index) => {
              const isInvalidScore = isScoreOverMax(sor.score, sor.max);
              const isCompleteSor = isCompleteScore(sor.score, sor.max);
              const sorColors = getScoreColor(sor.score, sor.max);
              const customInputStyle = isInvalidScore
                ? {
                    backgroundColor: "rgba(239, 68, 68, 0.12)",
                    color: "#ef4444",
                    borderColor: "#ef4444",
                  }
                : isCompleteSor
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
                      value={sor.score ?? ""}
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
                      value={sor.max ?? ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleSorChange(sor.id, "max", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      className={styles.numInput}
                      style={customInputStyle}
                    />
                  </div>
                  <span
                    className={`${styles.validationError} ${
                      !isInvalidScore ? styles.hiddenValidationError : ""
                    }`}
                  >
                    {t("calculator.score_over_max")}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <div className={styles.bottomInputsRow}>
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
            <h3 className={styles.sectionTitle}>
              {t("calculator.soch_title")}
            </h3>
            <div className={styles.sochRowContainer}>
              {(() => {
                const isInvalidScore = isScoreOverMax(
                  soch?.score ?? null,
                  soch?.max ?? null,
                );
                const isCompleteSoch = isCompleteScore(
                  soch?.score ?? null,
                  soch?.max ?? null,
                );
                const sochColors = getScoreColor(
                  soch?.score ?? null,
                  soch?.max ?? null,
                );
                const customInputStyle = isInvalidScore
                  ? {
                      backgroundColor: "rgba(239, 68, 68, 0.12)",
                      color: "#ef4444",
                      borderColor: "#ef4444",
                    }
                  : isCompleteSoch
                    ? {
                        backgroundColor: sochColors.bg,
                        color: sochColors.text,
                        borderColor: sochColors.border,
                      }
                    : {};
                return (
                  <div className={styles.sochInputs}>
                    <div className={styles.inputsWrapper}>
                      <Input
                        type="number"
                        min="0"
                        max={MAX_POINTS}
                        placeholder={t("calculator.sor_score")}
                        value={soch?.score ?? ""}
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
                        value={soch?.max ?? ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleSochChange("max", e.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        className={styles.numInput}
                        style={customInputStyle}
                      />
                    </div>
                    <span
                      className={`${styles.validationError} ${
                        !isInvalidScore ? styles.hiddenValidationError : ""
                      }`}
                    >
                      {t("calculator.score_over_max")}
                    </span>
                  </div>
                );
              })()}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};
