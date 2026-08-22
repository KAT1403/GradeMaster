import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Pin, BookOpen, ChevronRight, Play, Trash2, Plus, BarChart2, Search } from "lucide-react";
import { useUIStore } from "../../../shared/store/uiStore";
import { useHistoryManager } from "../../../features/history/model/store";
import type { HistoryEntry } from "../../../features/history/model/store";
import {
  getEntryGrade,
  getEntryPercent,
  getEntrySemesterSummary,
  isSemesterEntry,
} from "../../../features/history/lib/entry";
import { useLoadRecord } from "../../../features/history/lib/useRecordActions";
import { Card } from "../../../shared/ui/card";
import { InfoTooltip } from "../../../shared/ui/InfoTooltip";
import { FINAL_SCORE_TO_PERCENT } from "../../../shared/lib/grading";
import { calculateIntlGPA } from "../../../shared/lib/converters";
import styles from "./SubjectsPage.module.scss";

export default function SubjectsPage() {
  const { t } = useTranslation();
  const { entries, togglePin, deleteEntry } = useHistoryManager();
  const loadRecord = useLoadRecord();
  const setActiveTab = useUIStore((state) => state.setActiveTab);

  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<number | null>(null);

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
    loadRecord(entry);
    setActiveTab("workspace");
  };

  const getCardColorClass = (subject: HistoryEntry) => {
    const grade = getEntryGrade(subject);
    if (grade >= 4) return styles.successGrade;
    if (grade >= 3) return styles.warningGrade;
    return styles.dangerGrade;
  };

  const matchesFilters = (subject: HistoryEntry) => {
    if (search && !subject.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (gradeFilter !== null && getEntryGrade(subject) !== gradeFilter) return false;
    return true;
  };

  const pinnedSubjects = entries.filter((e) => e.isPinned && matchesFilters(e));
  const otherSubjects = entries.filter((e) => !e.isPinned && matchesFilters(e));

  const getSystemLabel = (subject: HistoryEntry) => {
    if (isSemesterEntry(subject)) {
      return t("calculator.uni_tab_semester");
    }
    switch (subject.data.selectedSystem) {
      case "kundelik":
        return t("workspace.system_kundelik");
      case "university":
        return t("workspace.system_university");
      case "final":
        return t("workspace.system_final");
      default:
        return "BilimClass";
    }
  };

  const renderGradeInfo = (subject: HistoryEntry) => {
    const percent = getEntryPercent(subject);

    if (isSemesterEntry(subject)) {
      const { semesterGPA, semesterGPALetter, totalCredits } =
        getEntrySemesterSummary(subject);
      return `GPA ${semesterGPA.toFixed(2)} (${semesterGPALetter}) - ${t("calculator.uni_credits")}: ${totalCredits}`;
    }

    if (subject.data.selectedSystem === "university") {
      const gpaInfo = calculateIntlGPA(percent);
      return `${gpaInfo.score.toFixed(2)} (${gpaInfo.letter}) - ${percent.toFixed(1)}%`;
    }

    if (subject.data.selectedSystem === "final") {
      const score = percent / FINAL_SCORE_TO_PERCENT;
      return `${score.toFixed(2)} (${t("calculator.grade")}: ${getEntryGrade(subject)})`;
    }

    return `${Math.round(percent)}% (${t("calculator.grade")}: ${getEntryGrade(subject)})`;
  };

  const quality =
    entries.length > 0
      ? (entries.filter((entry) => getEntryGrade(entry) >= 4).length /
          entries.length) *
        100
      : 0;

  const bestSubject =
    entries.length > 0
      ? entries.reduce(
          (best, current) =>
            getEntryPercent(current) > getEntryPercent(best) ? current : best,
          entries[0],
        )
      : null;

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

      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder={t("subjects.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          {([null, 5, 4, 3, 2] as (number | null)[]).map((g) => (
            <button
              key={String(g)}
              className={`${styles.filterChip} ${gradeFilter === g ? styles.filterChipActive : ""} ${
                g === 5 ? styles.chip5 : g === 4 ? styles.chip4 : g === 3 ? styles.chip3 : g === 2 ? styles.chip2 : ""
              }`}
              onClick={() => setGradeFilter(g)}
            >
              {g === null ? t("subjects.filter_all") : t(`subjects.filter_${g}`)}
            </button>
          ))}
        </div>
      </div>

      <Card className={styles.asomCard}>
        <h2 className={styles.asomTitle}>
          <BarChart2 size={20} color="var(--accent-primary)" />
          <span>{t("subjects.asom_title")}</span>
        </h2>
        <div className={styles.asomGrid}>
          <div className={styles.asomItem}>
            <span className={styles.asomLabel}>{t("subjects.total_subjects")}</span>
            <span className={styles.asomValue}>{entries.length}</span>
          </div>
          <div className={styles.asomItem}>
            <span className={styles.asomLabel}>
              {t("subjects.quality_of_knowledge")}
              <InfoTooltip content={t("subjects.quality_of_knowledge_tooltip")} />
            </span>
            <span className={styles.asomValue}>{quality.toFixed(1)}%</span>
            <div className={styles.asomProgress}>
              <div 
                className={styles.asomProgressBar} 
                style={{ width: `${quality}%`, backgroundColor: "var(--accent-primary)" }} 
              />
            </div>
          </div>
          {bestSubject && (
            <div className={styles.asomItem}>
              <span className={styles.asomLabel}>{t("subjects.best_subject")}</span>
              <span className={styles.bestSubjectName} title={`${bestSubject.title} (${renderGradeInfo(bestSubject)})`}>
                {bestSubject.title}
              </span>
              <span className={styles.bestSubjectValue}>
                {renderGradeInfo(bestSubject)}
              </span>
              <div className={styles.asomProgress}>
                <div 
                  className={styles.asomProgressBar} 
                  style={{ width: `${getEntryPercent(bestSubject)}%`, backgroundColor: "var(--accent-primary)" }} 
                />
              </div>
            </div>
          )}
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
                    <span className={styles.systemBadge}>{getSystemLabel(subject)}</span>
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
                    <span className={styles.systemBadge}>{getSystemLabel(subject)}</span>
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
