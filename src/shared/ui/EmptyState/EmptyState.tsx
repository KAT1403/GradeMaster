import { useTranslation } from "react-i18next";
import styles from "./EmptyState.module.scss";

interface EmptyStateProps {
  onNavigate: () => void;
}

export const EmptyState = ({ onNavigate }: EmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>📊</div>
      <h3 className={styles.emptyTitle}>{t("predictor.empty.title")}</h3>
      <p className={styles.emptyDescription}>
        {t("predictor.empty.description")}
      </p>
      <button className={styles.emptyButton} onClick={onNavigate}>
        {t("predictor.empty.button")}
      </button>
    </div>
  );
};
