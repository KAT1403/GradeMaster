import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "../../../shared/ui/card";
import { User, CloudLightning, Shield, Users, Award, Lock, X } from "lucide-react";
import styles from "./ProfilePage.module.scss";

export default function ProfilePage() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatarCircle}>
          <User size={48} className={styles.avatarIcon} />
        </div>
        <div className={styles.profileInfo}>
          <h1 className={styles.userName}>{t("profile.guest")}</h1>
          <span className={styles.userStatusBadge}>Local Offline</span>
        </div>
      </div>

      <Card className={styles.syncCard}>
        <div className={styles.syncContent}>
          <div className={styles.syncIconContainer}>
            <CloudLightning size={28} className={styles.syncIcon} />
          </div>
          <div className={styles.syncText}>
            <h2 className={styles.syncTitle}>{t("profile.sync_title")}</h2>
            <p className={styles.syncDesc}>{t("profile.sync_desc")}</p>
          </div>
        </div>
        <button className={styles.syncBtn} onClick={() => setIsModalOpen(true)}>
          <Shield size={16} />
          <span>{t("profile.sync_btn")}</span>
        </button>
      </Card>

      <div className={styles.lockedSections}>
        <div className={styles.sectionHeader}>
          <Users size={20} className={styles.sectionIcon} />
          <h3 className={styles.sectionTitle}>{t("profile.friends")}</h3>
          <span className={styles.comingSoonBadge}>{t("profile.soon")}</span>
        </div>
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className={styles.skeletonCard}>
              <div className={styles.skeletonAvatar} />
              <div className={styles.skeletonTextContainer}>
                <div className={styles.skeletonLineShort} />
                <div className={styles.skeletonLineLong} />
              </div>
              <Lock size={14} className={styles.lockIcon} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.lockedSections}>
        <div className={styles.sectionHeader}>
          <Award size={20} className={styles.sectionIcon} />
          <h3 className={styles.sectionTitle}>{t("profile.achievements")}</h3>
          <span className={styles.comingSoonBadge}>{t("profile.soon")}</span>
        </div>
        <div className={styles.skeletonGridBento}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className={styles.skeletonBentoItem}>
              <div className={styles.skeletonBadgeShape} />
              <div className={styles.skeletonLineShort} style={{ margin: "12px auto 0 auto" }} />
              <Lock size={16} className={styles.lockIconBento} />
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)} aria-label="Close">
              <X size={20} />
            </button>
            <div className={styles.modalHeader}>
              <div className={styles.modalIconBox}>
                <CloudLightning size={24} />
              </div>
              <h3 className={styles.modalTitle}>{t("profile.modal_title")}</h3>
            </div>
            <p className={styles.modalDesc}>{t("profile.modal_desc")}</p>
            <button className={styles.modalCloseBtn} onClick={() => setIsModalOpen(false)}>
              {t("profile.modal_close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
