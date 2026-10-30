import {
  FINAL_SCORE_TO_PERCENT,
  calculateFinalScore,
  calculateSchoolFinalSummary,
  calculateSemesterSummary,
  calculateTotalPercent,
  gpaToPercentEquivalent,
  type SemesterSummary,
} from "../../../shared/lib/grading";
import { normalizeSystem } from "../../../shared/lib/storageMigrations";
import type {
  AcademicRecordDraft,
  AcademicRecordSnapshot,
} from "../model/types";

export const isSemesterRecord = (record: AcademicRecordDraft): boolean =>
  record.selectedSystem === "university" && record.uniSubMode === "semester";

export const getRecordPlatform = (record: AcademicRecordDraft): string => {
  const sys = normalizeSystem(record.selectedSystem);
  return sys === "university"
    ? `university:${record.uniSubMode}`
    : sys;
};

export const createRecordSnapshot = (
  record: AcademicRecordDraft,
): AcademicRecordSnapshot => {
  const base = {
    selectedSystem: normalizeSystem(record.selectedSystem),
    finalQ1: record.finalQ1,
    finalQ2: record.finalQ2,
    finalQ3: record.finalQ3,
    finalQ4: record.finalQ4,
    finalExam: record.finalExam,
    fos: [...record.fos],
    sors: record.sors.map((sor) => ({ ...sor })),
    soch: record.soch ? { ...record.soch } : null,
    schoolFinalMode: record.schoolFinalMode,
    schoolFinalSubjects: record.schoolFinalSubjects.map((subject) => ({ ...subject })),
  };

  if (isSemesterRecord(record)) {
    return {
      ...base,
      uniSubMode: "semester",
      uniMidterm1: null,
      uniMidterm2: null,
      uniExam: null,
      semesterSubjects: record.semesterSubjects.map((sub) => ({ ...sub })),
      ...calculateSemesterSummary(record.semesterSubjects),
    };
  }

  return {
    ...base,
    uniSubMode: "subject",
    uniMidterm1: record.uniMidterm1,
    uniMidterm2: record.uniMidterm2,
    uniExam: record.uniExam,
    semesterSubjects: [],
  };
};

export const getRecordSemesterSummary = (
  record: AcademicRecordSnapshot,
): SemesterSummary => {
  const computed = calculateSemesterSummary(record.semesterSubjects);

  return {
    totalPoints: record.totalPoints ?? computed.totalPoints,
    totalCredits: record.totalCredits ?? computed.totalCredits,
    semesterGPA: record.semesterGPA ?? computed.semesterGPA,
    semesterGPALetter: record.semesterGPALetter ?? computed.semesterGPALetter,
  };
};

export const getRecordPercent = (record: AcademicRecordSnapshot): number => {
  if (isSemesterRecord(record)) {
    return gpaToPercentEquivalent(getRecordSemesterSummary(record).semesterGPA);
  }

  const sys = normalizeSystem(record.selectedSystem);

  if (sys === "final") {
    const schoolFinalSummary = calculateSchoolFinalSummary(record.schoolFinalSubjects);

    return schoolFinalSummary.filledSubjects > 0
      ? schoolFinalSummary.percent
      : calculateFinalScore(record).score * FINAL_SCORE_TO_PERCENT;
  }

  return calculateTotalPercent(
    {
      fos: record.fos,
      sors: record.sors,
      soch: record.soch,
      uniMidterm1: record.uniMidterm1,
      uniMidterm2: record.uniMidterm2,
      uniExam: record.uniExam,
    },
    sys,
  );
};

export const isRecordEmpty = (record: AcademicRecordDraft): boolean => {
  const sys = normalizeSystem(record.selectedSystem);

  if (sys === "final") {
    return (
      record.schoolFinalSubjects.every(
        (subject) => !subject.title.trim() && subject.grade === null,
      ) &&
      record.finalQ1 === null &&
      record.finalQ2 === null &&
      record.finalQ3 === null &&
      record.finalQ4 === null &&
      record.finalExam === null
    );
  }

  if (sys === "university") {
    return isSemesterRecord(record)
      ? record.semesterSubjects.length === 0
      : record.uniMidterm1 === null &&
          record.uniMidterm2 === null &&
          record.uniExam === null;
  }

  return (
    record.fos.length === 0 &&
    record.sors.every((sor) => sor.score === null && sor.max === null) &&
    (!record.soch || (record.soch.score === null && record.soch.max === null))
  );
};

export const getRecordFingerprint = (record: AcademicRecordDraft): string => {
  const platform = getRecordPlatform(record);
  const sys = normalizeSystem(record.selectedSystem);

  if (sys === "final") {
    return JSON.stringify({
      platform,
      mode: record.schoolFinalMode,
      subjects: record.schoolFinalSubjects.map((subject) => [
        subject.title,
        subject.year,
        subject.grade,
      ]),
      quarters: [record.finalQ1, record.finalQ2, record.finalQ3, record.finalQ4],
      exam: record.finalExam,
    });
  }

  if (sys === "university") {
    return isSemesterRecord(record)
      ? JSON.stringify({
          platform,
          subjects: record.semesterSubjects.map((sub) => [
            sub.title,
            sub.credits,
            sub.letter,
          ]),
        })
      : JSON.stringify({
          platform,
          midterms: [record.uniMidterm1, record.uniMidterm2],
          exam: record.uniExam,
        });
  }

  return JSON.stringify({
    platform,
    fos: record.fos,
    sors: record.sors.map((sor) => [sor.score, sor.max]),
    soch: record.soch ? [record.soch.score, record.soch.max] : null,
  });
};
