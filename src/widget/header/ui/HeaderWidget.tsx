import { useTranslation } from "react-i18next";
import { useUIStore } from "../../../app/store/uiStore";
import type { TabType } from "../../../app/store/uiStore";
import styles from "./HeaderWidget.module.scss";
import { useState, useRef, useEffect } from "react";
import { Sun, Moon, History, Calculator, LineChart, BarChart3, Info } from "lucide-react";
import { HistoryDrawer } from "../../../features/history/ui/HistoryDrawer";

export const HeaderWidget = () => {
  const { t, i18n } = useTranslation();
  const activeTab = useUIStore((state) => state.activeTab);
  const theme = useUIStore((state) => state.theme);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsTooltipVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLanguage = () => {
    const currentLang = i18n.language.slice(0, 2).toLowerCase();
    const nextLang = currentLang === "ru" ? "kz" : "ru";
    i18n.changeLanguage(nextLang);
    localStorage.setItem("gradeMasterLang", nextLang);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "calculator", label: t("tabs.calculator"), icon: <Calculator size={18} /> },
    { id: "predictor", label: t("tabs.predictor"), icon: <LineChart size={18} /> },
    { id: "analytics", label: t("tabs.analytics"), icon: <BarChart3 size={18} /> },
    { id: "info", label: t("tabs.info"), icon: <Info size={18} /> },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.logo}>GradeMaster</div>
          <div
            className={styles.betaWrapper}
            ref={tooltipRef}
            onMouseEnter={() => setIsTooltipVisible(true)}
            onMouseLeave={() => setIsTooltipVisible(false)}
            onClick={() => setIsTooltipVisible(!isTooltipVisible)}
          >
            <span className={styles.betaBadge}>BETA</span>
            <div
              className={`${styles.tooltip} ${isTooltipVisible ? styles.visible : ""}`}
            >
              {t("header.betaTooltip")}
              <button 
                className={styles.contactLink}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab("info");
                  setIsTooltipVisible(false);
                }}
              >
                {t("header.writeUs")}
              </button>
            </div>
          </div>
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
          <button className={styles.langBtn} onClick={switchLanguage}>
            {i18n.language.slice(0, 2).toUpperCase()}
          </button>
        </div>
      </div>
      <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </header>
  );
};
