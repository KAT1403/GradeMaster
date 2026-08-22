import type { KeyboardEvent } from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAcademicRecordStore } from "../../../entities/academic-record/model/store";
import type { AcademicSystem } from "../../../entities/academic-record/model/types";
import { useActiveRecord } from "../../../features/history/lib/useActiveRecord";
import { useUIStore } from "../../../shared/store/uiStore";
import { SaveModal } from "../../../features/history/ui/SaveModal";
import { ResetConfirmModal } from "../../../features/history/ui/ResetConfirmModal";
import { Card } from "../../../shared/ui/card";
import { PredictorWidget } from "../../predictor";
import { AnalyticsWidget } from "../../analytics";
import { HelpCircle, Save, RotateCcw } from "lucide-react";
import styles from "./CalculatorWidget.module.scss";
import { ResultCard } from "./components/ResultCard";
import { StandardSchoolInputs } from "./components/StandardSchoolInputs";
import { SchoolFinalsInputs } from "./components/SchoolFinalsInputs";
import { UniversitySubjectInputs } from "./components/UniversitySubjectInputs";
import { UniversitySemesterTable } from "./components/UniversitySemesterTable";

export const CalculatorWidget = () => {
  const { t } = useTranslation();
  const theme = useUIStore((state) => state.theme);
  const logoSrc = theme === "dark" ? "/img/Logo2.png" : "/img/Logo1.png";
  const {
    selectedSystem,
    setSelectedSystem,
    resetAll,
    uniSubMode,
    setUniSubMode,
    setUniMidterm1,
    setUniMidterm2,
    setUniExam,
    setSemesterSubjects,
    clearActiveRecordId,
  } = useAcademicRecordStore();
  const { currentEntry, hasUnsavedChanges } = useActiveRecord();

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

  const handleSystemChange = (sysId: AcademicSystem) => {
    setSelectedSystem(sysId);
    if (sysId === "final" || sysId === "university") {
      setSubTab("input");
    }
  };

  const resetCurrentInputs = () => {
    if (selectedSystem !== "university") {
      resetAll();
      return;
    }

    if (uniSubMode === "subject") {
      setUniMidterm1(null);
      setUniMidterm2(null);
      setUniExam(null);
    } else {
      setSemesterSubjects([]);
    }

    clearActiveRecordId();
  };

  const handleResetClick = () => {
    if (hasUnsavedChanges) {
      setIsResetModalOpen(true);
    } else {
      resetCurrentInputs();
    }
  };

  const handleConfirmSaveBeforeReset = () => {
    setIsResetModalOpen(false);
    setResetAfterSave(true);
    setIsSaveModalOpen(true);
  };

  const handleDiscardAndReset = () => {
    setIsResetModalOpen(false);
    resetCurrentInputs();
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

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.brandHeader}>
        <div className={styles.brandTitle}>
          <img src={logoSrc} className={styles.logoImg} alt="GradeMaster Logo" />
          <span className={styles.brandMain}>GradeMaster</span>
          <span className={styles.brandSeparator}>//</span>
          <span className={styles.brandSub}>
            {currentEntry ? currentEntry.title : t("workspace.subtitle")}
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

      <ResultCard />

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
            <button
              className={`${styles.saveBtn} ${!hasUnsavedChanges ? styles.disabled : ""}`}
              onClick={() => setIsSaveModalOpen(true)}
              disabled={!hasUnsavedChanges}
            >
              <Save size={16} />
              <span>{t("history.save_btn")}</span>
            </button>
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
