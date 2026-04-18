import { useTranslation } from "react-i18next";
import { Pin, PinOff } from "lucide-react";
import { useHistoryManager, type HistoryEntry } from "../model/store";
import { useAcademicRecordStore } from "../../../entities/academic-record/model/store";
import styles from "./HistoryDrawer.module.scss";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryDrawer = ({ isOpen, onClose }: HistoryDrawerProps) => {
  const { t } = useTranslation();
  const { entries, deleteEntry, togglePin } = useHistoryManager();
  const { setFOS, setSORS, setSOCH, setActiveRecord } = useAcademicRecordStore();

  const handleLoad = (entry: HistoryEntry) => {
    setActiveRecord(entry.id, entry.title);
    setFOS(entry.data.fos);
    setSORS(entry.data.sors);
    setSOCH(entry.data.soch);
    
    onClose();
  };

  const handleTogglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    togglePin(id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(t("history.delete_confirm"))) {
      deleteEntry(id);
    }
  };

  const sortedEntries = [...entries].sort((a, b) => Number(b.isPinned || false) - Number(a.isPinned || false) || b.lastModified - a.lastModified);

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <div className={`${styles.drawer} ${isOpen ? styles.open : ""}`}>
        <div className={styles.header}>
          <h2>{t("history.title")}</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        
        <div className={styles.content}>
          {entries.length === 0 ? (
            <p className={styles.empty}>{t("history.empty")}</p>
          ) : (
            <div className={styles.list}>
              {sortedEntries.map((entry) => (
                <div key={entry.id} className={`${styles.item} ${entry.isPinned ? styles.pinned : ""}`} onClick={() => handleLoad(entry)}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitleRow}>
                      {entry.isPinned && <Pin size={12} className={styles.pinnedIcon} />}
                      <span className={styles.itemTitle}>{entry.title}</span>
                    </div>
                    <span className={styles.itemDate}>
                      {new Date(entry.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.itemRight}>
                    <span className={styles.itemBadge}>{entry.finalPercent.toFixed(1)}%</span>
                    <button className={styles.pinActionBtn} onClick={(e) => handleTogglePin(e, entry.id)}>
                      {entry.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                    </button>
                    <button className={styles.deleteBtn} onClick={(e) => handleDelete(e, entry.id)}>
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
