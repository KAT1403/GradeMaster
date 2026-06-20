import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useAcademicRecordStore } from "../../../entities/academic-record/model/store";
import { useHistoryManager } from "../model/store";
import { calculateTotalPercent } from "../../../shared/lib/grading";
import styles from "./SaveModal.module.scss";

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveComplete?: () => void;
}

export const SaveModal = ({
  isOpen,
  onClose,
  onSaveComplete,
}: SaveModalProps) => {
  const { activeRecordId, activeRecordTitle } = useAcademicRecordStore();

  if (!isOpen) return null;

  return createPortal(
    <SaveModalContent
      key={`${activeRecordId ?? "new"}:${activeRecordTitle ?? ""}`}
      onClose={onClose}
      onSaveComplete={onSaveComplete}
    />,
    document.body
  );
};

const SaveModalContent = ({
  onClose,
  onSaveComplete,
}: Omit<SaveModalProps, "isOpen">) => {
  const { t } = useTranslation();
  const {
    fos,
    sors,
    soch,
    selectedSystem,
    finalQ1,
    finalQ2,
    finalQ3,
    finalQ4,
    finalExam,
    activeRecordId,
    activeRecordTitle,
    setActiveRecord,
    uniMidterm1,
    uniMidterm2,
    uniExam,
  } = useAcademicRecordStore();
  const { saveEntry, entries } = useHistoryManager();

  const activeEntry = activeRecordId ? entries.find((e) => e.id === activeRecordId) : null;
  const savedSystem = activeEntry?.data.selectedSystem || "bilim_class";
  const isSamePlatform = !activeRecordId || selectedSystem === savedSystem;

  const [title, setTitle] = useState(isSamePlatform ? (activeRecordTitle || "") : "");

  const handleSave = (asNew: boolean = false) => {
    if (!title.trim()) return;
    
    let finalPercent = 0;
    if (selectedSystem === "final") {
      const quarters = [finalQ1, finalQ2, finalQ3, finalQ4].filter((q): q is number => q !== null);
      const avgQuarters = quarters.length > 0 ? quarters.reduce((sum, val) => sum + val, 0) / quarters.length : 0;
      const finalGrade = finalExam !== null
        ? avgQuarters * 0.7 + finalExam * 0.3
        : avgQuarters;
      finalPercent = finalGrade * 20;
    } else {
      finalPercent = calculateTotalPercent(
        { fos, sors, soch, uniMidterm1, uniMidterm2, uniExam },
        selectedSystem
      );
    }

    const data = {
      fos,
      sors,
      soch,
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

    let idToSave = Date.now().toString();

    if (!asNew && activeRecordId) {
      idToSave = activeRecordId;
    }

    saveEntry(idToSave, title.trim(), data, finalPercent);
    setActiveRecord(idToSave, title.trim());
    onClose();
    if (onSaveComplete) {
      onSaveComplete();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <h3 className={styles.title}>{t("history.save_modal_title")}</h3>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {activeRecordId && isSamePlatform ? (
          <div className={styles.updateFlow}>
            <p className={styles.desc}>
              {t("history.subject_name")}: <strong>{activeRecordTitle}</strong>
            </p>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave(false);
              }}
              placeholder={t("history.save_modal_desc")}
            />
            <div className={styles.actions}>
              <button
                className={styles.btnSecondary}
                onClick={() => handleSave(true)}
              >
                {t("history.save_as_new_btn")}
              </button>
              <button
                className={styles.btnPrimary}
                onClick={() => handleSave(false)}
              >
                {t("history.update_btn")}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.newFlow}>
            <p className={styles.desc}>{t("history.save_modal_desc")}</p>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave(true);
              }}
              placeholder={t("history.save_modal_desc")}
              autoFocus
            />
            <div className={styles.actions}>
              <button className={styles.btnSecondary} onClick={onClose}>
                {t("history.cancel")}
              </button>
              <button
                className={styles.btnPrimary}
                onClick={() => handleSave(true)}
                disabled={!title.trim()}
              >
                {t("history.save_btn")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

