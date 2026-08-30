import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { useUIStore } from "../../../shared/store/uiStore";
import { useInstallPrompt } from "../lib/useInstallPrompt";
import styles from "./InstallBanner.module.scss";

export const InstallBanner = () => {
  const { t } = useTranslation();
  const theme = useUIStore((state) => state.theme);
  const { visible, mode, install, dismiss } = useInstallPrompt();

  if (!visible) return null;

  const logoSrc = theme === "dark" ? "/img/Logo2.png" : "/img/Logo1.png";
  const isIOS = mode === "ios";

  return (
    <div
      className={styles.banner}
      role="dialog"
      aria-labelledby="install-banner-title"
    >
      <img src={logoSrc} className={styles.logo} alt="" width={36} height={36} />

      <div className={styles.body}>
        <p className={styles.title} id="install-banner-title">
          {t("install.title")}
        </p>
        <p className={styles.hint}>
          {isIOS ? t("install.ios.hint") : t("install.hint")}
        </p>
      </div>

      <div className={styles.actions}>
        {!isIOS && (
          <button className={styles.primary} onClick={() => void install()} type="button">
            {t("install.action")}
          </button>
        )}
        <button
          className={styles.close}
          onClick={dismiss}
          aria-label={t("install.dismiss")}
          type="button"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
