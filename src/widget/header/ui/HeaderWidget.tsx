import { useTranslation } from "react-i18next";
import { useUIStore } from "../../../shared/store/uiStore";
import type { TabType } from "../../../shared/store/uiStore";
import styles from "./HeaderWidget.module.scss";
import { useState, useRef, useEffect } from "react";
import { Sun, Moon, History, Calculator, BookOpen, User, Settings, Globe, ChevronDown } from "lucide-react";
import { HistoryDrawer } from "../../../features/history/ui/HistoryDrawer";

export const HeaderWidget = () => {
  const { t, i18n } = useTranslation();
  const activeTab = useUIStore((state) => state.activeTab);
  const theme = useUIStore((state) => state.theme);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("gradeMasterLang", lang);
    setIsLangMenuOpen(false);
  };

  const languages = [
    { code: 'ru', label: 'RU' },
    { code: 'kz', label: 'KZ' },
    { code: 'en', label: 'EN' }
  ];

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "workspace", label: t("tabs.workspace"), icon: <Calculator size={18} /> },
    { id: "subjects", label: t("tabs.subjects"), icon: <BookOpen size={18} /> },
    { id: "profile", label: t("tabs.profile"), icon: <User size={18} /> },
    { id: "settings", label: t("tabs.settings"), icon: <Settings size={18} /> },
  ];

  const logoSrc = theme === "dark" ? "/img/Logo2.png" : "/img/Logo1.png";

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <img src={logoSrc} className={styles.logoImg} alt="GradeMaster Logo" />
          <h1 className={styles.logo}>GradeMaster</h1>
        </div>

        <nav className={styles.tabBar}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.actions}>
          <button
            className={styles.themeToggle}
            onClick={() => setIsHistoryOpen(true)}
            aria-label="Toggle history"
          >
            <History size={20} />
          </button>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <div className={styles.langWrapper} ref={langMenuRef}>
            <button 
              className={styles.langBtn} 
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              aria-label="Select language"
            >
              <Globe size={18} />
              <span>{i18n.language.slice(0, 2).toUpperCase()}</span>
              <ChevronDown size={14} className={`${styles.chevron} ${isLangMenuOpen ? styles.rotated : ''}`} />
            </button>
            
            {isLangMenuOpen && (
              <div className={styles.langDropdown}>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`${styles.langOption} ${i18n.language.slice(0, 2).toLowerCase() === lang.code ? styles.activeLang : ''}`}
                    onClick={() => changeLanguage(lang.code)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </header>
  );
};
