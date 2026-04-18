export interface GPAInfo {
  score: number;
  letter: string;
}

export const calculateIntlGPA = (percent: number): GPAInfo => {
  if (percent >= 95) return { score: 4.0, letter: "A" };
  if (percent >= 90) return { score: 3.67, letter: "A-" };
  if (percent >= 85) return { score: 3.33, letter: "B+" };
  if (percent >= 80) return { score: 3.0, letter: "B" };
  if (percent >= 75) return { score: 2.67, letter: "B-" };
  if (percent >= 70) return { score: 2.33, letter: "C+" };
  if (percent >= 65) return { score: 2.0, letter: "C" };
  return { score: 0.0, letter: "F" };
};
