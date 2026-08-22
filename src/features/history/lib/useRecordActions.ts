import { createRecordSnapshot } from "../../../entities/academic-record/lib/record";
import { useAcademicRecordStore } from "../../../entities/academic-record/model/store";
import { useHistoryManager, type HistoryEntry } from "../model/store";

export const useSaveRecord = () => {
  const record = useAcademicRecordStore();
  const saveEntry = useHistoryManager((state) => state.saveEntry);

  return (id: string, title: string) => {
    saveEntry(id, title, createRecordSnapshot(record));
    record.setActiveRecordId(id);
  };
};

export const useLoadRecord = () => {
  const loadSnapshot = useAcademicRecordStore((state) => state.loadSnapshot);

  return (entry: HistoryEntry) => loadSnapshot(entry.data, entry.id);
};
