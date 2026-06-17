export interface GradeScaleItem {
  min: number;
  max: number;
  letter: string;
  gpa: number;
}

export const KAZ_UNIVERSITY_SCALE: GradeScaleItem[] = [
  { min: 95, max: 100, letter: "A", gpa: 4.00 },
  { min: 90, max: 94, letter: "A-", gpa: 3.67 },
  { min: 85, max: 89, letter: "B+", gpa: 3.33 },
  { min: 80, max: 84, letter: "B", gpa: 3.00 },
  { min: 75, max: 79, letter: "B-", gpa: 2.67 },
  { min: 70, max: 74, letter: "C+", gpa: 2.33 },
  { min: 65, max: 69, letter: "C", gpa: 2.00 },
  { min: 60, max: 64, letter: "C-", gpa: 1.67 },
  { min: 55, max: 59, letter: "D+", gpa: 1.33 },
  { min: 50, max: 54, letter: "D", gpa: 1.00 },
  { min: 25, max: 49, letter: "FX", gpa: 0.50 },
  { min: 0, max: 24, letter: "F", gpa: 0.00 },
];

export interface GPAInfo {
  score: number;
  letter: string;
}

export const calculateIntlGPA = (percent: number): GPAInfo => {
  const rounded = Math.round(percent);
  const found = KAZ_UNIVERSITY_SCALE.find(item => rounded >= item.min && rounded <= item.max);
  if (found) {
    return { score: found.gpa, letter: found.letter };
  }
  return { score: 0.0, letter: "F" };
};
