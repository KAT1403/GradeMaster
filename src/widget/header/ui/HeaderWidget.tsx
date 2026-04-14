import { useTranslation } from "react-i18next";
import { useUIStore } from "../../../app/store/uiStore";
import type { TabType } from "../../../app/store/uiStore";
import styles from "./HeaderWidget.module.scss";
import { useState, useRef, useEffect } from "react";

export const HeaderWidget = () => {
  const { t, i18n } = useTranslation();
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
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

  const tabs: { id: TabType; label: string }[] = [
    { id: "calculator", label: t("tabs.calculator") },
    { id: "predictor", label: t("tabs.predictor") },
    { id: "analytics", label: t("tabs.analytics") },
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
            <div className={`${styles.tooltip} ${isTooltipVisible ? styles.visible : ""}`}>
              {t("header.betaTooltip")}
              <a href="#" className={styles.contactLink}>
                {t("header.writeUs")}
              </a>
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
              {tab.label}
            </button>
          ))}
        </nav>

        <button className={styles.langBtn} onClick={switchLanguage}>
          {i18n.language.slice(0, 2).toUpperCase()}
        </button>
      </div>
    </header>
  );
};
