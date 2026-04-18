import { useState } from "react";
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
  const { t } = useTranslation();
  const {
    fos,
    sors,
    soch,
    activeRecordId,
    activeRecordTitle,
    setActiveRecord,
  } = useAcademicRecordStore();
  const { saveEntry } = useHistoryManager();

  const [title, setTitle] = useState(activeRecordTitle || "");
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setTitle(activeRecordTitle || "");
    }
  }

  if (!isOpen) return null;

  const handleSave = (asNew: boolean = false) => {
    if (!title.trim()) return;
    const finalPercent = calculateTotalPercent({ fos, sors, soch });
    const data = { fos, sors, soch };

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

        {activeRecordId ? (
          <div className={styles.updateFlow}>
            <p className={styles.desc}>
              {t("history.subject_name")}: <strong>{activeRecordTitle}</strong>
            </p>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave(false);
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
                onClick={() => handleSave(false)}
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
