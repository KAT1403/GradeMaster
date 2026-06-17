import type { ChangeEvent, KeyboardEvent } from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAcademicRecordStore } from "../../../entities/academic-record/model/store";
import { useHistoryManager } from "../../../features/history/model/store";
import { SaveModal } from "../../../features/history/ui/SaveModal";
import { ResetConfirmModal } from "../../../features/history/ui/ResetConfirmModal";
import { SmartPaste } from "../../../features/smart-paste";
import {
  calculateTotalPercent,
  getGradeFromPercent,
  getNextGradeInfo,
  getGradeColors,
  getFoColor,
  getScoreColor,
  isCompleteScore,
  isScoreOverMax,
} from "../../../shared/lib/grading";
import { Card } from "../../../shared/ui/card";
import { DigitalNumpad } from "../../../shared/ui/digital-numpad";
import { Input } from "../../../shared/ui/input/ui/Input";
import { ProgressBar } from "../../../shared/ui/ProgressBar";
import { calculateIntlGPA, KAZ_UNIVERSITY_SCALE } from "../../../shared/lib/converters";
import { PredictorWidget } from "../../predictor";
import { AnalyticsWidget } from "../../analytics";
import { CloudOff, HelpCircle, Save, RotateCcw, Trash2 } from "lucide-react";
import styles from "./CalculatorWidget.module.scss";

export const CalculatorWidget = () => {
  const { t } = useTranslation();
  const {
    fos,
    sors,
    soch,
    selectedSystem,
    setSelectedSystem,
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
    activeRecordId,
    activeRecordTitle,
    addFO,
    removeFO,
    updateSOR,
    setSOCH,
    resetAll,
    uniSubMode,
    uniMidterm1,
    uniMidterm2,
    uniExam,
    semesterSubjects,
    setUniSubMode,
    setUniMidterm1,
    setUniMidterm2,
    setUniExam,
    addSemesterSubject,
    removeSemesterSubject,
    updateSemesterSubject,
  } = useAcademicRecordStore();
  const { entries } = useHistoryManager();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetAfterSave, setResetAfterSave] = useState(false);
  const [subTab, setSubTab] = useState<"input" | "predictor" | "analytics">("input");
  const [isPredictorExpanded, setIsPredictorExpanded] = useState(false);

  const systems = [
    { id: "bilim_class", label: "BilimClass" },
    { id: "kundelik", label: t("workspace.system_kundelik") },
    { id: "university", label: t("workspace.system_university") },
    { id: "final", label: t("workspace.system_final") }
  ] as const;

  const handleSystemChange = (sysId: "bilim_class" | "kundelik" | "university" | "final") => {
    setSelectedSystem(sysId);
    if (sysId === "final" || sysId === "university") {
      setSubTab("input");
    }
  };

  const isFormEmpty = selectedSystem === "final"
    ? finalQ1 === null && finalQ2 === null && finalQ3 === null && finalQ4 === null && finalExam === null
    : selectedSystem === "university"
    ? uniMidterm1 === null && uniMidterm2 === null && uniExam === null
    : fos.length === 0 &&
      sors.every((s) => s.score === null && s.max === null) &&
      (!soch || (soch.score === null && soch.max === null));

  let hasUnsavedChanges = false;
  if (activeRecordId) {
    const activeEntry = entries.find((e) => e.id === activeRecordId);
    if (activeEntry) {
      const currentData = {
        fos,
        sors: sors.map((s) => ({ score: s.score, max: s.max })),
        soch: soch ? { score: soch.score, max: soch.max } : null,
        selectedSystem,
        finalQ1,
        finalQ2,
        finalQ3,
        finalQ4,
        finalExam,
        uniMidterm1,
        uniMidterm2,
        uniExam,
      };
      const savedData = {
        fos: activeEntry.data.fos,
        sors: activeEntry.data.sors.map((s) => ({
          score: s.score,
          max: s.max,
        })),
        soch: activeEntry.data.soch
          ? {
              score: activeEntry.data.soch.score,
              max: activeEntry.data.soch.max,
            }
          : null,
        selectedSystem: activeEntry.data.selectedSystem || "bilim_class",
        finalQ1: activeEntry.data.finalQ1 !== undefined ? activeEntry.data.finalQ1 : null,
        finalQ2: activeEntry.data.finalQ2 !== undefined ? activeEntry.data.finalQ2 : null,
        finalQ3: activeEntry.data.finalQ3 !== undefined ? activeEntry.data.finalQ3 : null,
        finalQ4: activeEntry.data.finalQ4 !== undefined ? activeEntry.data.finalQ4 : null,
        finalExam: activeEntry.data.finalExam !== undefined ? activeEntry.data.finalExam : null,
        uniMidterm1: activeEntry.data.uniMidterm1 !== undefined ? activeEntry.data.uniMidterm1 : null,
        uniMidterm2: activeEntry.data.uniMidterm2 !== undefined ? activeEntry.data.uniMidterm2 : null,
        uniExam: activeEntry.data.uniExam !== undefined ? activeEntry.data.uniExam : null,
      };
      hasUnsavedChanges =
        JSON.stringify(currentData) !== JSON.stringify(savedData);
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
    } else if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
      e.preventDefault();
    }
  };

  const quarters = [finalQ1, finalQ2, finalQ3, finalQ4].filter((q): q is number => q !== null);
  const avgQuarters = quarters.length > 0 ? quarters.reduce((sum, val) => sum + val, 0) / quarters.length : 0;
  const finalGradeScore = quarters.length > 0
    ? (finalExam !== null ? avgQuarters * 0.7 + finalExam * 0.3 : avgQuarters)
    : 0;

  const currentPercent = selectedSystem === "final"
    ? finalGradeScore * 20
    : calculateTotalPercent(
        { fos, sors, soch, uniMidterm1, uniMidterm2, uniExam },
        selectedSystem
      );

  const currentGrade = selectedSystem === "final"
    ? (quarters.length > 0 ? Math.round(finalGradeScore) : 0)
    : (currentPercent === 0 &&
       fos.length === 0 &&
       sors.filter((s) => s.max !== null && s.max > 0).length === 0 &&
       !soch?.max
         ? 0
         : getGradeFromPercent(currentPercent));
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

  const intlGPA = calculateIntlGPA(currentPercent);

  const ECTS_VALUES: Record<string, number> = {
    "A": 4.00, "A-": 3.67, "B+": 3.33, "B": 3.00, "B-": 2.67,
    "C+": 2.33, "C": 2.00, "C-": 1.67, "D+": 1.33, "D": 1.00,
    "FX": 0.50, "F": 0.00
  };

  const getUniGradeColors = (letter: string) => {
    if (["A", "A-", "B+", "B", "B-"].includes(letter)) {
      return { bg: "#3b8f21", text: "#ffffff", border: "#3b8f21", solid: "#3b8f21" };
    }
    if (["C+", "C", "C-", "D+", "D"].includes(letter)) {
      return { bg: "#ff8e12", text: "#ffffff", border: "#ff8e12", solid: "#ff8e12" };
    }
    return { bg: "#d13142", text: "#ffffff", border: "#d13142", solid: "#d13142" };
  };

  const currentGradeColors = selectedSystem === "university"
    ? getUniGradeColors(intlGPA.letter)
    : getGradeColors(currentGrade);

  const rd = (uniMidterm1 !== null || uniMidterm2 !== null)
    ? ((uniMidterm1 ?? 0) + (uniMidterm2 ?? 0)) / ((uniMidterm1 !== null ? 1 : 0) + (uniMidterm2 !== null ? 1 : 0))
    : 0;
  const isAllowed = rd >= 50;

  const totalPoints = semesterSubjects.reduce((sum, sub) => sum + (ECTS_VALUES[sub.letter] || 0) * sub.credits, 0);
  const totalCredits = semesterSubjects.reduce((sum, sub) => sum + sub.credits, 0);
  const semesterGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;

  const getLetterFromGPA = (gpaVal: number): string => {
    if (gpaVal >= 4.00) return "A";
    if (gpaVal >= 3.67) return "A-";
    if (gpaVal >= 3.33) return "B+";
    if (gpaVal >= 3.00) return "B";
    if (gpaVal >= 2.67) return "B-";
    if (gpaVal >= 2.33) return "C+";
    if (gpaVal >= 2.00) return "C";
    if (gpaVal >= 1.67) return "C-";
    if (gpaVal >= 1.33) return "D+";
    if (gpaVal >= 1.00) return "D";
    if (gpaVal >= 0.50) return "FX";
    return "F";
  };

  const semesterGPALetter = totalCredits > 0 ? getLetterFromGPA(semesterGPA) : "-";
  const semesterGPAColor = totalCredits > 0 ? getUniGradeColors(semesterGPALetter) : { solid: "var(--accent-primary)" };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.brandHeader}>
        <div className={styles.brandTitle}>
          <span className={styles.brandMain}>GradeMaster</span>
          <span className={styles.brandSeparator}>//</span>
          <span className={styles.brandSub}>
            {activeRecordTitle ? activeRecordTitle : t("workspace.subtitle")}
          </span>
        </div>
        <div className={styles.syncStatus}>
          <CloudOff size={14} className={styles.syncIcon} />
          <span>{t("workspace.status")}</span>
        </div>
      </div>
      <div className={styles.systemSelector}>
        {systems.map((sys) => (
          <button
            key={sys.id}
            className={`${styles.systemTab} ${selectedSystem === sys.id ? styles.active : ""}`}
            onClick={() => handleSystemChange(sys.id)}
          >
            {sys.label}
          </button>
        ))}
      </div>

      {selectedSystem === "university" && uniSubMode === "semester" ? (
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

          <div className={styles.percentDisplay}>
            {semesterGPA.toFixed(2)}
          </div>

          <div className={styles.uniStatsGrid}>
            <div className={styles.uniStatChip}>
              {t("calculator.uni_credits")}: {totalCredits}
            </div>
          </div>
        </Card>
      ) : (
        <Card className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <span className={styles.resultTitle}>
              {selectedSystem === "university"
                ? "ВУЗ Оценка"
                : selectedSystem === "final"
                ? "Итоговая оценка"
                : t("calculator.total_percent")}
            </span>
            <div
              className={styles.gradeBadge}
              style={{ backgroundColor: currentGradeColors.solid }}
            >
              {selectedSystem === "university"
                ? (uniMidterm1 !== null || uniMidterm2 !== null ? intlGPA.letter : "-")
                : (currentGrade || "-")}
            </div>
          </div>

          <div className={styles.percentDisplay}>
            {selectedSystem === "university"
              ? `${(uniMidterm1 !== null || uniMidterm2 !== null || uniExam !== null) ? currentPercent.toFixed(1) : "0.0"}%`
              : selectedSystem === "final"
              ? quarters.length > 0 ? `${finalGradeScore.toFixed(2)}` : "0.00"
              : `${currentPercent.toFixed(selectedSystem === "kundelik" ? 2 : 1)}%`}
          </div>

          {selectedSystem === "university" ? (
            <div className={styles.uniStatsGrid}>
              <div className={styles.uniStatChip}>
                GPA: {intlGPA.score.toFixed(2)}
              </div>
              {(uniMidterm1 !== null || uniMidterm2 !== null) && (!isAllowed || uniExam === null) && (
                <div className={`${styles.uniStatChip} ${isAllowed ? styles.uniStatChipSuccess : styles.uniStatChipDanger}`}>
                  {isAllowed ? t("calculator.uni_status_allowed") : t("calculator.uni_status_not_allowed")}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.gpaSimple}>
              {selectedSystem === "final"
                ? `GPA: ${intlGPA.score.toFixed(2)} (${intlGPA.letter}) | Четверти: ${finalQ1 || "-"}/${finalQ2 || "-"}/${finalQ3 || "-"}/${finalQ4 || "-"} | Экзамен: ${finalExam || "-"}`
                : `GPA: ${intlGPA.score.toFixed(2)} (${intlGPA.letter})`}
            </div>
          )}

          {selectedSystem !== "final" && selectedSystem !== "university" && (
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
          )}
        </Card>
      )}
      {selectedSystem !== "final" && selectedSystem !== "university" && (
        <div className={styles.subTabsContainer}>
          <button
            className={`${styles.subTab} ${subTab === "input" ? styles.active : ""}`}
            onClick={() => setSubTab("input")}
          >
            {t("workspace.tab_grades")}
          </button>
          <button
            className={`${styles.subTab} ${subTab === "predictor" ? styles.active : ""}`}
            onClick={() => setSubTab("predictor")}
          >
            {t("workspace.tab_predictor")}
          </button>
          <button
            className={`${styles.subTab} ${subTab === "analytics" ? styles.active : ""}`}
            onClick={() => setSubTab("analytics")}
          >
            {t("workspace.tab_analytics")}
          </button>
        </div>
      )}

      {subTab === "input" && (
        <div className={styles.inputTabContent}>
          {selectedSystem === "final" ? (
            <div className={styles.finalGradesContainer}>
              {[
                { label: "1-я четверть", val: finalQ1, setter: setFinalQ1 },
                { label: "2-я четверть", val: finalQ2, setter: setFinalQ2 },
                { label: "3-я четверть", val: finalQ3, setter: setFinalQ3 },
                { label: "4-я четверть", val: finalQ4, setter: setFinalQ4 },
              ].map((quarter, idx) => (
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
                          style={active ? { backgroundColor: colors.solid, borderColor: colors.solid, color: "#ffffff" } : {}}
                          onClick={() => quarter.setter(quarter.val === grade ? null : grade)}
                        >
                          {grade}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              ))}

              <Card className={`${styles.sectionCard} ${styles.examCard}`}>
                <h3 className={styles.sectionTitle}>Экзамен (необязательно)</h3>
                <div className={styles.finalGradeSelector}>
                  {[2, 3, 4, 5].map((grade) => {
                    const active = finalExam === grade;
                    const colors = getGradeColors(grade);
                    return (
                      <button
                        key={grade}
                        className={`${styles.finalGradeBtn} ${active ? styles.active : ""}`}
                        style={active ? { backgroundColor: colors.solid, borderColor: colors.solid, color: "#ffffff" } : {}}
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
                    Без экзамена
                  </button>
                </div>
              </Card>
            </div>
          ) : selectedSystem === "university" ? (
            <div className={styles.inputsGrid}>
              <div className={styles.uniSubModeSelector}>
                <button
                  type="button"
                  className={`${styles.uniSubModeTab} ${uniSubMode === "subject" ? styles.active : ""}`}
                  onClick={() => setUniSubMode("subject")}
                >
                  {t("calculator.uni_tab_subject")}
                </button>
                <button
                  type="button"
                  className={`${styles.uniSubModeTab} ${uniSubMode === "semester" ? styles.active : ""}`}
                  onClick={() => setUniSubMode("semester")}
                >
                  {t("calculator.uni_tab_semester")}
                </button>
              </div>

              {uniSubMode === "subject" ? (
                <div className={styles.uniInputsContainer}>
                  <Card className={styles.sectionCard}>
                    <h3 className={styles.sectionTitle}>{t("calculator.uni_tab_subject")}</h3>
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
                            const val = e.target.value === "" ? null : Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
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
                            const val = e.target.value === "" ? null : Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                            setUniMidterm2(val);
                          }}
                          onKeyDown={handleKeyDown}
                        />
                      </div>

                      <div className={styles.uniField}>
                        <label className={`${styles.uniLabel} ${!isAllowed ? styles.uniLabelDisabled : ""}`}>
                          {t("calculator.uni_exam")} (0-100)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder={isAllowed ? "0-100" : "Блокировано (РД < 50)"}
                          value={uniExam ?? ""}
                          disabled={!isAllowed}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const val = e.target.value === "" ? null : Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
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

                  {uniExam === null && isAllowed && (uniMidterm1 !== null || uniMidterm2 !== null) && (
                    <Card className={styles.uniPredictorCard}>
                      <h4 className={styles.uniPredictorTitle}>{t("predictor.title")}</h4>
                      <div className={styles.uniPredictorList}>
                        {(() => {
                          const targetScales = KAZ_UNIVERSITY_SCALE.filter(item => item.letter !== "FX" && item.letter !== "F");
                          const visibleScales = isPredictorExpanded ? targetScales : targetScales.slice(0, 3);
                          return visibleScales.map((item) => {
                            const targetMin = item.min;
                            const neededExamScore = Math.ceil((targetMin - rd * 0.6) / 0.4);
                            let desc = "";
                            if (neededExamScore > 100) {
                              desc = t("calculator.uni_predictor_impossible", { grade: item.letter });
                            } else if (neededExamScore <= 0) {
                              desc = t("calculator.uni_predictor_achieved");
                            } else {
                              desc = t("calculator.uni_predictor_needed", { grade: item.letter, score: neededExamScore });
                            }
                            return (
                              <div key={item.letter} className={styles.uniPredictorItem}>
                                <span className={styles.uniPredictorLetter} style={{ color: getUniGradeColors(item.letter).solid }}>
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
                        {isPredictorExpanded ? "Свернуть" : "Показать все цели"}
                      </button>
                      <div className={styles.uniB2BAlert}>
                        {t("calculator.uni_b2b_alert")}
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <div className={styles.uniInputsContainer}>
                  <Card className={styles.sectionCard}>
                    <h3 className={styles.sectionTitle}>{t("calculator.uni_tab_semester")}</h3>
                    <div style={{ overflowX: "auto" }}>
                      <table className={styles.uniTable}>
                        <thead>
                          <tr>
                            <th>{t("calculator.uni_subject_placeholder")}</th>
                            <th>{t("calculator.uni_credits")}</th>
                            <th>{t("calculator.uni_grade_header")}</th>
                            <th style={{ textAlign: "center" }}>{t("calculator.uni_action_header")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {semesterSubjects.map((sub) => (
                            <tr key={sub.id}>
                              <td data-label={t("calculator.uni_subject_placeholder")}>
                                <Input
                                  type="text"
                                  value={sub.title}
                                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateSemesterSubject(sub.id, "title", e.target.value)}
                                  className={styles.uniSubjectInput}
                                  placeholder={t("calculator.uni_subject_placeholder")}
                                />
                              </td>
                              <td data-label={t("calculator.uni_credits")}>
                                <select
                                  value={sub.credits}
                                  onChange={(e) => updateSemesterSubject(sub.id, "credits", parseInt(e.target.value) || 3)}
                                  className={styles.uniSelect}
                                >
                                  {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td data-label={t("calculator.uni_grade_header")}>
                                <select
                                  value={sub.letter}
                                  onChange={(e) => updateSemesterSubject(sub.id, "letter", e.target.value)}
                                  className={styles.uniSelect}
                                >
                                  {Object.keys(ECTS_VALUES).map((letter) => (
                                    <option key={letter} value={letter}>
                                      {letter} ({ECTS_VALUES[letter].toFixed(2)})
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => removeSemesterSubject(sub.id)}
                                  className={styles.uniDeleteBtn}
                                  aria-label="Remove subject"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button type="button" onClick={addSemesterSubject} className={styles.uniAddBtn}>
                      {t("calculator.uni_add_subject")}
                    </button>

                    <div className={styles.uniExplanation}>
                      <h4>Математика расчета GPA</h4>
                      <p>
                        {t("calculator.uni_gpa_explanation", {
                          points: totalPoints.toFixed(2),
                          credits: totalCredits,
                          gpa: semesterGPA.toFixed(2)
                        })}
                      </p>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          ) : (
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
                      const customInputStyle =
                        isInvalidScore
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
                    <h3 className={styles.sectionTitle}>{t("calculator.soch_title")}</h3>
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
                        const customInputStyle =
                          isInvalidScore
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
          )}
          <div className={styles.bottomButtons}>
            {!(selectedSystem === "university" && uniSubMode === "semester") && (
              <button
                className={`${styles.saveBtn} ${!hasUnsavedChanges ? styles.disabled : ""}`}
                onClick={() => setIsSaveModalOpen(true)}
                disabled={!hasUnsavedChanges}
              >
                <Save size={16} />
                <span>{t("history.save_btn")}</span>
              </button>
            )}
            <button className={styles.resetBtn} onClick={handleResetClick}>
              <RotateCcw size={16} />
              <span>{t("calculator.reset")}</span>
            </button>
          </div>
        </div>
      )}

      {subTab === "predictor" && (
        <div className={styles.predictorTabContent}>
          <PredictorWidget />
          <Card className={styles.explanationCard}>
            <div className={styles.explanationHeader}>
              <HelpCircle size={18} className={styles.explanationIcon} />
              <h3 className={styles.explanationTitle}>
                {t("workspace.explanation_title")}
              </h3>
            </div>
            <p className={styles.explanationBody}>
              {t("workspace.explanation_body")}
            </p>
          </Card>
        </div>
      )}

      {subTab === "analytics" && (
        <div className={styles.analyticsTabContent}>
          <AnalyticsWidget />
        </div>
      )}

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
