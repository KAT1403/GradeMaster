import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useActiveRecord } from "../lib/useActiveRecord";
import { useSaveRecord } from "../lib/useRecordActions";
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
  if (!isOpen) return null;

  return createPortal(
    <SaveModalContent onClose={onClose} onSaveComplete={onSaveComplete} />,
    document.body
  );
};

const SaveModalContent = ({
  onClose,
  onSaveComplete,
}: Omit<SaveModalProps, "isOpen">) => {
  const { t } = useTranslation();
  const { currentEntry } = useActiveRecord();
  const saveRecord = useSaveRecord();

  const canUpdate = currentEntry !== null;
  const [title, setTitle] = useState(currentEntry?.title ?? "");

  const handleSave = (asNew: boolean = false) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const idToSave =
      !asNew && currentEntry ? currentEntry.id : crypto.randomUUID();

    saveRecord(idToSave, trimmedTitle);
    onClose();
    onSaveComplete?.();
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

        {canUpdate ? (
          <div className={styles.updateFlow}>
            <p className={styles.desc}>
              {t("history.subject_name")}: <strong>{currentEntry?.title}</strong>
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
