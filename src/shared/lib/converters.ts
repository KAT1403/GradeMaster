
export interface GPAInfo {
  score: number;
  letter: string;
}

/**
 * Calculates International GPA (4.0 scale) based on unweighted mapping
 * Used for US/South Korea standard comparison.
 */
export const calculateIntlGPA = (percent: number): GPAInfo => {
  if (percent >= 95) return { score: 4.00, letter: 'A' };
  if (percent >= 90) return { score: 3.67, letter: 'A-' };
  if (percent >= 85) return { score: 3.33, letter: 'B+' };
  if (percent >= 80) return { score: 3.00, letter: 'B' };
  if (percent >= 75) return { score: 2.67, letter: 'B-' };
  if (percent >= 70) return { score: 2.33, letter: 'C+' };
  if (percent >= 65) return { score: 2.00, letter: 'C' };
  return { score: 0.00, letter: 'F' };
};
