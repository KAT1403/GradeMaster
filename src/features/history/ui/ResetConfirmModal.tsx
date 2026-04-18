import { useTranslation } from "react-i18next";
import styles from "./SaveModal.module.scss";

interface ResetConfirmModalProps {
  isOpen: boolean;
  onConfirmSave: () => void;
  onConfirmDiscard: () => void;
  onCancel: () => void;
}

export const ResetConfirmModal = ({
  isOpen,
  onConfirmSave,
  onConfirmDiscard,
  onCancel,
}: ResetConfirmModalProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <h3 className={styles.title}>{t("history.reset_modal_title")}</h3>
          <button
            className={styles.closeBtn}
            onClick={onCancel}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <p className={styles.desc}>{t("history.reset_modal_desc")}</p>

        <div className={styles.actions} style={{ marginTop: "24px" }}>
          <button className={styles.btnSecondary} onClick={onConfirmDiscard}>
            {t("history.reset_btn_discard")}
          </button>
          <button className={styles.btnPrimary} onClick={onConfirmSave}>
            {t("history.reset_btn_save")}
          </button>
        </div>
      </div>
    </div>
  );
};
