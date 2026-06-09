import { useTranslation } from "react-i18next";
import { useAcademicRecordStore } from "../../../entities/academic-record/model/store";
import { useUIStore } from "../../../app/store/uiStore";
import { useHistoryManager } from "../../../features/history/model/store";
import type { HistoryEntry } from "../../../features/history/model/store";
import { Card } from "../../../shared/ui/card";
import { Pin, BookOpen, ChevronRight, Play, Trash2, Plus } from "lucide-react";
import { getGradeFromPercent } from "../../../shared/lib/grading";
import styles from "./SubjectsPage.module.scss";

export default function SubjectsPage() {
  const { t } = useTranslation();
  const { entries, togglePin, deleteEntry } = useHistoryManager();
  const { setFOS, setSORS, setSOCH, setActiveRecord } = useAcademicRecordStore();
  const setActiveTab = useUIStore((state) => state.setActiveTab);

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    togglePin(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t("history.delete_confirm"))) {
      deleteEntry(id);
    }
  };

  const handleLoadSubject = (entry: HistoryEntry) => {
    setFOS(entry.data.fos);
    setSORS(entry.data.sors);
    setSOCH(entry.data.soch);
    setActiveRecord(entry.id, entry.title);
    setActiveTab("workspace");
  };

  const pinnedSubjects = entries.filter((e) => e.isPinned);
  const otherSubjects = entries.filter((e) => !e.isPinned);

  const getCardColorClass = (percent: number) => {
    const grade = getGradeFromPercent(percent);
    if (grade >= 4) return styles.successGrade;
    if (grade >= 3) return styles.warningGrade;
    return styles.dangerGrade;
  };

  if (entries.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <BookOpen className={styles.headerIcon} size={28} />
            <h1 className={styles.title}>{t("subjects.title")}</h1>
          </div>
        </div>
        <Card className={styles.emptyCard}>
          <BookOpen size={48} className={styles.emptyIcon} />
          <p className={styles.emptyText}>{t("subjects.empty")}</p>
          <button className={styles.addFirstBtn} onClick={() => setActiveTab("workspace")}>
            <Plus size={16} />
            <span>{t("predictor.empty.button")}</span>
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <BookOpen className={styles.headerIcon} size={28} />
          <h1 className={styles.title}>{t("subjects.title")}</h1>
        </div>
        <button className={styles.addBtnHeader} onClick={() => setActiveTab("workspace")}>
          <Plus size={16} />
          <span>{t("subjects.add_subject")}</span>
        </button>
      </div>

      {pinnedSubjects.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("subjects.pinned")}</h2>
          <div className={styles.bentoGrid}>
            {pinnedSubjects.map((subject) => {
              const grade = getGradeFromPercent(subject.finalPercent);
              return (
                <Card key={subject.id} className={`${styles.bentoCard} ${styles.pinnedCard}`}>
                  <div className={styles.cardHeader}>
                    <span className={styles.systemBadge}>25/25/50</span>
                    <div className={styles.headerActions}>
                      <button
                        className={`${styles.pinBtn} ${styles.pinned}`}
                        onClick={(e) => handleTogglePin(subject.id, e)}
                        aria-label="Unpin"
                      >
                        <Pin size={16} fill="var(--accent-primary)" />
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={(e) => handleDelete(subject.id, e)}
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.cardMain} onClick={() => handleLoadSubject(subject)}>
                    <h3 className={styles.subjectName}>{subject.title}</h3>
                    <div className={styles.gradeDisplay}>
                      <span className={styles.gradeLabel}>{t("subjects.average")}</span>
                      <span className={`${styles.gradeValue} ${getCardColorClass(subject.finalPercent)}`}>
                        {subject.finalPercent.toFixed(1)}% (Оценка: {grade})
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <button className={styles.loadBtn} onClick={() => handleLoadSubject(subject)}>
                      <Play size={12} fill="currentColor" />
                      <span>{t("subjects.load_grades")}</span>
                    </button>
                    <ChevronRight size={16} className={styles.arrowIcon} />
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {otherSubjects.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("subjects.all")}</h2>
          <div className={styles.bentoGrid}>
            {otherSubjects.map((subject) => {
              const grade = getGradeFromPercent(subject.finalPercent);
              return (
                <Card key={subject.id} className={styles.bentoCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.systemBadge}>25/25/50</span>
                    <div className={styles.headerActions}>
                      <button
                        className={styles.pinBtn}
                        onClick={(e) => handleTogglePin(subject.id, e)}
                        aria-label="Pin"
                      >
                        <Pin size={16} />
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={(e) => handleDelete(subject.id, e)}
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.cardMain} onClick={() => handleLoadSubject(subject)}>
                    <h3 className={styles.subjectName}>{subject.title}</h3>
                    <div className={styles.gradeDisplay}>
                      <span className={styles.gradeLabel}>{t("subjects.average")}</span>
                      <span className={`${styles.gradeValue} ${getCardColorClass(subject.finalPercent)}`}>
                        {subject.finalPercent.toFixed(1)}% (Оценка: {grade})
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <button className={styles.loadBtn} onClick={() => handleLoadSubject(subject)}>
                      <Play size={12} fill="currentColor" />
                      <span>{t("subjects.load_grades")}</span>
                    </button>
                    <ChevronRight size={16} className={styles.arrowIcon} />
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
