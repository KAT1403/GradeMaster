import { useTranslation } from "react-i18next";
import { useUIStore } from "../../../shared/store/uiStore";
import { useAcademicRecordStore } from "../../../entities/academic-record/model/store";
import { useHistoryManager } from "../../../features/history/model/store";
import { Card } from "../../../shared/ui/card";
import { Settings, Sun, Moon, Globe, Trash2, ShieldAlert } from "lucide-react";
import styles from "./SettingsPage.module.scss";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  
  const resetAcademicRecord = useAcademicRecordStore((state) => state.resetAll);
  const clearHistory = useHistoryManager((state) => state.clearAll);

  const currentLang = i18n.language.slice(0, 2).toLowerCase();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("gradeMasterLang", lang);
  };

  const handleThemeChange = (selectedTheme: "light" | "dark") => {
    if (theme !== selectedTheme) {
      toggleTheme();
    }
  };

  const handleWipeDatabase = () => {
    if (window.confirm(t("settings.wipe_confirm"))) {
      resetAcademicRecord();
      clearHistory();
      localStorage.removeItem("ui-storage");
      localStorage.removeItem("academic-record-storage");
      localStorage.removeItem("grademaster-history");
      window.location.reload();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Settings className={styles.headerIcon} size={28} />
        <h1 className={styles.title}>{t("settings.title")}</h1>
      </div>

      <div className={styles.settingsList}>
        <Card className={styles.settingCard}>
          <h2 className={styles.sectionTitle}>{t("settings.theme_label")}</h2>
          <div className={styles.toggleGrid}>
            <button
              className={`${styles.toggleOption} ${theme === "dark" ? styles.active : ""}`}
              onClick={() => handleThemeChange("dark")}
            >
              <Moon size={18} />
              <span>{t("settings.theme_dark")}</span>
            </button>
            <button
              className={`${styles.toggleOption} ${theme === "light" ? styles.active : ""}`}
              onClick={() => handleThemeChange("light")}
            >
              <Sun size={18} />
              <span>{t("settings.theme_light")}</span>
            </button>
          </div>
        </Card>

        <Card className={styles.settingCard}>
          <h2 className={styles.sectionTitle}>{t("settings.lang_label")}</h2>
          <div className={styles.toggleGrid}>
            <button
              className={`${styles.toggleOption} ${currentLang === "ru" ? styles.active : ""}`}
              onClick={() => handleLanguageChange("ru")}
            >
              <Globe size={16} />
              <span>Русский (RU)</span>
            </button>
            <button
              className={`${styles.toggleOption} ${currentLang === "kz" ? styles.active : ""}`}
              onClick={() => handleLanguageChange("kz")}
            >
              <Globe size={16} />
              <span>Қазақша (KZ)</span>
            </button>
            <button
              className={`${styles.toggleOption} ${currentLang === "en" ? styles.active : ""}`}
              onClick={() => handleLanguageChange("en")}
            >
              <Globe size={16} />
              <span>English (EN)</span>
            </button>
          </div>
        </Card>

        <Card className={`${styles.settingCard} ${styles.dangerCard}`}>
          <div className={styles.dangerHeader}>
            <ShieldAlert size={20} className={styles.dangerIcon} />
            <h2 className={styles.sectionTitle}>{t("settings.danger_label")}</h2>
          </div>
          <p className={styles.dangerDesc}>
            {t("settings.wipe_confirm")}
          </p>
          <button className={styles.wipeBtn} onClick={handleWipeDatabase}>
            <Trash2 size={16} />
            <span>{t("settings.wipe_btn")}</span>
          </button>
        </Card>
      </div>

      <div className={styles.footerInfo}>
        <p className={styles.version}>{t("settings.version")} (v2.0.0-beta)</p>
      </div>
    </div>
  );
}
