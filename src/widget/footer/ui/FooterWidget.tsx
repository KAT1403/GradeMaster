import { Trans, useTranslation } from "react-i18next";
import styles from "./FooterWidget.module.scss";

export const FooterWidget = () => {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={`${styles.item} ${styles.copyright}`}>
          {t("footer.copyright", { year: 2026 })}
        </div>

        <div className={`${styles.item} ${styles.license}`}>
          {t("footer.license")}
        </div>

        <div className={`${styles.item} ${styles.privacy}`}>
          <Trans i18nKey="footer.privacy" components={{ strong: <strong /> }} />
        </div>
      </div>
      <div className={styles.credits}>
        Logo by{" "}
        <a href="https://t.me/Avakee1" target="_blank" rel="noreferrer">@Avakee1</a>
        {" & "}
        <a href="https://t.me/karynqexe" target="_blank" rel="noreferrer">@karynqexe</a>
      </div>
    </footer>
  );
};
