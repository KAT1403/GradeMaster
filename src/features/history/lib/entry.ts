import {
  getRecordPercent,
  getRecordSemesterSummary,
  isSemesterRecord,
} from "../../../entities/academic-record/lib/record";
import {
  FINAL_SCORE_TO_PERCENT,
  getGradeFromPercent,
} from "../../../shared/lib/grading";
import type { SemesterSummary } from "../../../shared/lib/grading";
import type { HistoryEntry } from "../model/store";

export const isSemesterEntry = (entry: HistoryEntry): boolean =>
  isSemesterRecord(entry.data);

export const getEntryPercent = (entry: HistoryEntry): number =>
  getRecordPercent(entry.data);

export const getEntrySemesterSummary = (entry: HistoryEntry): SemesterSummary =>
  getRecordSemesterSummary(entry.data);

export const getEntryGrade = (entry: HistoryEntry): number => {
  const percent = getEntryPercent(entry);

  return entry.data.selectedSystem === "final"
    ? Math.round(percent / FINAL_SCORE_TO_PERCENT)
    : getGradeFromPercent(percent);
};
