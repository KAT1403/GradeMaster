import {
  getRecordFingerprint,
  getRecordPlatform,
  isRecordEmpty,
} from "../../../entities/academic-record/lib/record";
import { useAcademicRecordStore } from "../../../entities/academic-record/model/store";
import { useHistoryManager, type HistoryEntry } from "../model/store";

export interface ActiveRecordInfo {
  currentEntry: HistoryEntry | null;
  isEmpty: boolean;
  hasUnsavedChanges: boolean;
}

export const useActiveRecord = (): ActiveRecordInfo => {
  const record = useAcademicRecordStore();
  const entries = useHistoryManager((state) => state.entries);

  const platform = getRecordPlatform(record);
  const fingerprint = getRecordFingerprint(record);

  const activeId = record.activeRecordIds[platform];
  const activeEntry = activeId
    ? (entries.find((entry) => entry.id === activeId) ?? null)
    : null;

  const currentEntry =
    activeEntry ??
    entries.find(
      (entry) =>
        getRecordPlatform(entry.data) === platform &&
        getRecordFingerprint(entry.data) === fingerprint,
    ) ??
    null;

  const isEmpty = isRecordEmpty(record);
  const hasUnsavedChanges = currentEntry
    ? getRecordFingerprint(currentEntry.data) !== fingerprint
    : !isEmpty;

  return { currentEntry, isEmpty, hasUnsavedChanges };
};
