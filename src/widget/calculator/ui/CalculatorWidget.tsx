import type { KeyboardEvent } from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAcademicRecordStore } from "../../../entities/academic-record/model/store";
import { useHistoryManager } from "../../../features/history/model/store";
import { useUIStore } from "../../../shared/store/uiStore";
import { SaveModal } from "../../../features/history/ui/SaveModal";
import { ResetConfirmModal } from "../../../features/history/ui/ResetConfirmModal";
import {
  calculateTotalPercent,
  getGradeFromPercent,
  getNextGradeInfo,
  getGradeColors,
} from "../../../shared/lib/grading";
import { Card } from "../../../shared/ui/card";
import {
  ECTS_VALUES,
  calculateIntlGPA,
  getLetterFromGPA,
} from "../../../shared/lib/converters";
import { PredictorWidget } from "../../predictor";
import { AnalyticsWidget } from "../../analytics";
import { HelpCircle, Save, RotateCcw } from "lucide-react";
import styles from "./CalculatorWidget.module.scss";
import { ResultCard } from "./components/ResultCard";
import { StandardSchoolInputs } from "./components/StandardSchoolInputs";
import { SchoolFinalsInputs } from "./components/SchoolFinalsInputs";
import { UniversitySubjectInputs } from "./components/UniversitySubjectInputs";
import { UniversitySemesterTable } from "./components/UniversitySemesterTable";

const getUniGradeColors = (letter: string) => {
  if (["A", "A-", "B+", "B", "B-"].includes(letter)) {
    return { bg: "#3b8f21", text: "#ffffff", border: "#3b8f21", solid: "#3b8f21" };
  }
  if (["C+", "C", "C-", "D+", "D"].includes(letter)) {
    return { bg: "#ff8e12", text: "#ffffff", border: "#ff8e12", solid: "#ff8e12" };
  }
  return { bg: "#d13142", text: "#ffffff", border: "#d13142", solid: "#d13142" };
};

export const CalculatorWidget = () => {
  const { t } = useTranslation();
  const theme = useUIStore((state) => state.theme);
  const logoSrc = theme === "dark" ? "/img/Logo2.png" : "/img/Logo1.png";
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
    activeRecordId,
    activeRecordTitle,
    resetAll,
    uniSubMode,
    uniMidterm1,
    uniMidterm2,
    uniExam,
    semesterSubjects,
    setUniSubMode,
  } = useAcademicRecordStore();
  const { entries } = useHistoryManager();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetAfterSave, setResetAfterSave] = useState(false);
  const [subTab, setSubTab] = useState<"input" | "predictor" | "analytics">("input");

  const systems = [
    { id: "bilim_class", label: t("workspace.system_bilim_class") },
    { id: "kundelik",    label: t("workspace.system_kundelik") },
    { id: "university",  label: t("workspace.system_university") },
    { id: "final",       label: t("workspace.system_final") },
  ] as const;

  const handleSystemChange = (
    sysId: "bilim_class" | "kundelik" | "university" | "final",
  ) => {
    setSelectedSystem(sysId);
    if (sysId === "final" || sysId === "university") {
      setSubTab("input");
    }
  };

  const isFormEmpty =
    selectedSystem === "final"
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
      const savedSystem = activeEntry.data.selectedSystem || "bilim_class";

      if (selectedSystem !== savedSystem) {
        // Switched to a different platform — treat as independent work, only
        // flag changes if the current platform's form has actual data.
        hasUnsavedChanges = !isFormEmpty;
      } else {
        // Same platform — compare only the fields relevant to this platform.
        let currentData: unknown;
        let savedData: unknown;

        if (selectedSystem === "final") {
          currentData = { finalQ1, finalQ2, finalQ3, finalQ4, finalExam };
          savedData = {
            finalQ1:   activeEntry.data.finalQ1   ?? null,
            finalQ2:   activeEntry.data.finalQ2   ?? null,
            finalQ3:   activeEntry.data.finalQ3   ?? null,
            finalQ4:   activeEntry.data.finalQ4   ?? null,
            finalExam: activeEntry.data.finalExam ?? null,
          };
        } else if (selectedSystem === "university") {
          currentData = { uniMidterm1, uniMidterm2, uniExam };
          savedData = {
            uniMidterm1: activeEntry.data.uniMidterm1 ?? null,
            uniMidterm2: activeEntry.data.uniMidterm2 ?? null,
            uniExam:     activeEntry.data.uniExam     ?? null,
          };
        } else {
          currentData = {
            selectedSystem,
            fos,
            sors: sors.map((s) => ({ score: s.score, max: s.max })),
            soch: soch ? { score: soch.score, max: soch.max } : null,
          };
          savedData = {
            selectedSystem: savedSystem,
            fos: activeEntry.data.fos,
            sors: activeEntry.data.sors.map((s) => ({ score: s.score, max: s.max })),
            soch: activeEntry.data.soch
              ? { score: activeEntry.data.soch.score, max: activeEntry.data.soch.max }
              : null,
          };
        }

        hasUnsavedChanges = JSON.stringify(currentData) !== JSON.stringify(savedData);
      }
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

  const quarters = [finalQ1, finalQ2, finalQ3, finalQ4].filter(
    (q): q is number => q !== null,
  );
  const avgQuarters =
    quarters.length > 0
      ? quarters.reduce((sum, val) => sum + val, 0) / quarters.length
      : 0;
  const finalGradeScore =
    quarters.length > 0
      ? finalExam !== null
        ? avgQuarters * 0.7 + finalExam * 0.3
        : avgQuarters
      : 0;

  const currentPercent =
    selectedSystem === "final"
      ? finalGradeScore * 20
      : calculateTotalPercent(
          { fos, sors, soch, uniMidterm1, uniMidterm2, uniExam },
          selectedSystem,
        );

  const currentGrade =
    selectedSystem === "final"
      ? quarters.length > 0
        ? Math.round(finalGradeScore)
        : 0
      : currentPercent === 0 &&
          fos.length === 0 &&
          sors.filter((s) => s.max !== null && s.max > 0).length === 0 &&
          !soch?.max
        ? 0
        : getGradeFromPercent(currentPercent);

  const nextGradeInfo = getNextGradeInfo(currentPercent);
  const intlGPA = calculateIntlGPA(currentPercent);

  const currentGradeColors =
    selectedSystem === "university"
      ? getUniGradeColors(intlGPA.letter)
      : getGradeColors(currentGrade);

  const rd =
    uniMidterm1 !== null || uniMidterm2 !== null
      ? ((uniMidterm1 ?? 0) + (uniMidterm2 ?? 0)) /
        ((uniMidterm1 !== null ? 1 : 0) + (uniMidterm2 !== null ? 1 : 0))
      : 0;
  const isAllowed = rd >= 50;

  const totalPoints = semesterSubjects.reduce(
    (sum, sub) => sum + (ECTS_VALUES[sub.letter] || 0) * sub.credits,
    0,
  );
  const totalCredits = semesterSubjects.reduce(
    (sum, sub) => sum + sub.credits,
    0,
  );
  const semesterGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
  const semesterGPALetter = totalCredits > 0 ? getLetterFromGPA(semesterGPA) : "-";
  const semesterGPAColor =
    totalCredits > 0
      ? getUniGradeColors(semesterGPALetter)
      : { solid: "var(--accent-primary)" };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.brandHeader}>
        <div className={styles.brandTitle}>
          <img src={logoSrc} className={styles.logoImg} alt="GradeMaster Logo" />
          <span className={styles.brandMain}>GradeMaster</span>
          <span className={styles.brandSeparator}>//</span>
          <span className={styles.brandSub}>
            {activeRecordTitle ? activeRecordTitle : t("workspace.subtitle")}
          </span>
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

      <ResultCard
        selectedSystem={selectedSystem}
        uniSubMode={uniSubMode}
        semesterGPA={semesterGPA}
        semesterGPALetter={semesterGPALetter}
        semesterGPAColor={semesterGPAColor}
        totalCredits={totalCredits}
        currentGradeColors={currentGradeColors}
        currentPercent={currentPercent}
        currentGrade={currentGrade}
        nextGradeInfo={nextGradeInfo}
        intlGPA={intlGPA}
        isAllowed={isAllowed}
        finalGradeScore={finalGradeScore}
        quartersLength={quarters.length}
        uniMidterm1={uniMidterm1}
        uniMidterm2={uniMidterm2}
        uniExam={uniExam}
        finalQ1={finalQ1}
        finalQ2={finalQ2}
        finalQ3={finalQ3}
        finalQ4={finalQ4}
        finalExam={finalExam}
      />

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
            <SchoolFinalsInputs />
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
                <UniversitySubjectInputs handleKeyDown={handleKeyDown} />
              ) : (
                <UniversitySemesterTable />
              )}
            </div>
          ) : (
            <StandardSchoolInputs handleKeyDown={handleKeyDown} />
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
          <PredictorWidget onNavigateToInput={() => setSubTab("input")} />
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
          <AnalyticsWidget onNavigateToInput={() => setSubTab("input")} />
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
