import { useTranslation } from "react-i18next";
import { useUIStore } from "../../../shared/store/uiStore";
import type { TabType } from "../../../shared/store/uiStore";
import { WorkspacePage } from "../../WorkspacePage";
import { SubjectsPage } from "../../SubjectsPage";
import { ProfilePage } from "../../ProfilePage";
import { SettingsPage } from "../../SettingsPage";
import { Calculator, BookOpen, User, Settings } from "lucide-react";
import styles from "./HomePage.module.scss";

export default function HomePage() {
  const { t } = useTranslation();
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);

  const navigationItems: {
    id: TabType;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "workspace",
      label: t("tabs.workspace"),
      icon: <Calculator size={20} />,
    },
    { id: "subjects", label: t("tabs.subjects"), icon: <BookOpen size={20} /> },
    { id: "profile", label: t("tabs.profile"), icon: <User size={20} /> },
    { id: "settings", label: t("tabs.settings"), icon: <Settings size={20} /> },
  ];

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <span className={styles.brandTitle}>GradeMaster</span>
          <span className={styles.brandVersion}>v2.0</span>
        </div>
        <nav className={styles.sidebarNav}>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.sidebarNavItem} ${activeTab === item.id ? styles.active : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <div className={styles.mainWrapper}>
        <main className={styles.mainContent} key={activeTab}>
          {activeTab === "workspace" && <WorkspacePage />}
          {activeTab === "subjects" && <SubjectsPage />}
          {activeTab === "profile" && <ProfilePage />}
          {activeTab === "settings" && <SettingsPage />}
        </main>
      </div>
      <nav className={styles.bottomNav}>
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.bottomNavItem} ${activeTab === item.id ? styles.active : ""}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className={styles.bottomNavIcon}>{item.icon}</span>
            <span className={styles.bottomNavLabel}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
