import { useTranslation } from "react-i18next";
import { useAcademicRecordStore } from "../../../entities/academic-record/model/store";
import { useUIStore } from "../../../shared/store/uiStore";
import { useHistoryManager } from "../../../features/history/model/store";
import type { HistoryEntry } from "../../../features/history/model/store";
import { Card } from "../../../shared/ui/card";
import { Pin, BookOpen, ChevronRight, Play, Trash2, Plus, BarChart2 } from "lucide-react";
import { getGradeFromPercent } from "../../../shared/lib/grading";
import { calculateIntlGPA } from "../../../shared/lib/converters";
import styles from "./SubjectsPage.module.scss";

export default function SubjectsPage() {
  const { t } = useTranslation();
  const { entries, togglePin, deleteEntry } = useHistoryManager();
  const {
    setFOS,
    setSORS,
    setSOCH,
    setSelectedSystem,
    setYearlyGrade,
    setExamGrade,
    setActiveRecord,
  } = useAcademicRecordStore();
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
    setSelectedSystem(entry.data.selectedSystem || "bilim_class");
    setYearlyGrade(entry.data.yearlyGrade !== undefined ? entry.data.yearlyGrade : null);
    setExamGrade(entry.data.examGrade !== undefined ? entry.data.examGrade : null);
    setActiveRecord(entry.id, entry.title);
    setActiveTab("workspace");
  };

  const pinnedSubjects = entries.filter((e) => e.isPinned);
  const otherSubjects = entries.filter((e) => !e.isPinned);

  const getSubjectGrade = (subject: HistoryEntry) => {
    if (subject.data?.selectedSystem === "final") {
      return Math.round(subject.finalPercent / 20);
    }
    return getGradeFromPercent(subject.finalPercent);
  };

  const getCardColorClass = (subject: HistoryEntry) => {
    const grade = getSubjectGrade(subject);
    if (grade >= 4) return styles.successGrade;
    if (grade >= 3) return styles.warningGrade;
    return styles.dangerGrade;
  };

  const getSystemLabel = (system?: string) => {
    switch (system) {
      case "bilim_class":
        return "BilimClass";
      case "kundelik":
        return t("workspace.system_kundelik");
      case "gpa":
        return t("workspace.system_gpa");
      case "final":
        return t("workspace.system_final");
      default:
        return "BilimClass";
    }
  };

  const renderGradeInfo = (subject: HistoryEntry) => {
    const system = subject.data?.selectedSystem || "bilim_class";
    if (system === "gpa") {
      const gpaInfo = calculateIntlGPA(subject.finalPercent);
      return `${gpaInfo.score.toFixed(2)} (Оценка: ${gpaInfo.letter})`;
    }
    if (system === "final") {
      const val = subject.finalPercent / 20;
      const rec = Math.round(val);
      return `${val.toFixed(2)} (Оценка: ${rec})`;
    }
    if (system === "kundelik") {
      const grade = getGradeFromPercent(subject.finalPercent);
      return `${subject.finalPercent.toFixed(2)}% (Оценка: ${grade})`;
    }
    const grade = getGradeFromPercent(subject.finalPercent);
    return `${Math.round(subject.finalPercent)}% (Оценка: ${grade})`;
  };

  const getASOMMetrics = () => {
    if (entries.length === 0) return { quality: 0, success: 0 };
    let excellentAndGoodCount = 0;
    let passingCount = 0;

    entries.forEach((subject) => {
      const grade = getSubjectGrade(subject);
      if (grade === 4 || grade === 5) {
        excellentAndGoodCount++;
      }
      if (grade >= 3 && grade <= 5) {
        passingCount++;
      }
    });

    const quality = (excellentAndGoodCount / entries.length) * 100;
    const success = (passingCount / entries.length) * 100;

    return { quality, success };
  };

  const { quality, success } = getASOMMetrics();

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

      <Card className={styles.asomCard}>
        <h2 className={styles.asomTitle}>
          <BarChart2 size={20} color="var(--accent-primary)" />
          <span>Мониторинг АСОМ (Успеваемость и Качество)</span>
        </h2>
        <div className={styles.asomGrid}>
          <div className={styles.asomItem}>
            <span className={styles.asomLabel}>Всего предметов</span>
            <span className={styles.asomValue}>{entries.length}</span>
          </div>
          <div className={styles.asomItem}>
            <span className={styles.asomLabel}>Качество знаний (4 и 5)</span>
            <span className={styles.asomValue}>{quality.toFixed(1)}%</span>
            <div className={styles.asomProgress}>
              <div 
                className={styles.asomProgressBar} 
                style={{ width: `${quality}%`, backgroundColor: "var(--accent-primary)" }} 
              />
            </div>
          </div>
          <div className={styles.asomItem}>
            <span className={styles.asomLabel}>Успеваемость (3, 4 и 5)</span>
            <span className={styles.asomValue}>{success.toFixed(1)}%</span>
            <div className={styles.asomProgress}>
              <div 
                className={styles.asomProgressBar} 
                style={{ width: `${success}%`, backgroundColor: "#3b8f21" }} 
              />
            </div>
          </div>
        </div>
      </Card>

      {pinnedSubjects.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("subjects.pinned")}</h2>
          <div className={styles.bentoGrid}>
            {pinnedSubjects.map((subject) => {
              return (
                <Card key={subject.id} className={`${styles.bentoCard} ${styles.pinnedCard}`}>
                  <div className={styles.cardHeader}>
                    <span className={styles.systemBadge}>{getSystemLabel(subject.data?.selectedSystem)}</span>
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
                      <span className={`${styles.gradeValue} ${getCardColorClass(subject)}`}>
                        {renderGradeInfo(subject)}
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
              return (
                <Card key={subject.id} className={styles.bentoCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.systemBadge}>{getSystemLabel(subject.data?.selectedSystem)}</span>
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
                      <span className={`${styles.gradeValue} ${getCardColorClass(subject)}`}>
                        {renderGradeInfo(subject)}
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
