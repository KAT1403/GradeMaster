import styles from "./DigitalNumpad.module.scss";
import type { CSSProperties } from "react";

export interface DigitalNumpadColors {
  bg: string;
  text: string;
  border: string;
}

interface DigitalNumpadProps {
  onNumberClick: (num: number) => void;
  getColors?: (num: number) => DigitalNumpadColors | undefined;
}

export const DigitalNumpad = ({
  onNumberClick,
  getColors,
}: DigitalNumpadProps) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className={styles.grid}>
      {numbers.map((num) => {
        const colors = getColors ? getColors(num) : undefined;
        const customStyle: CSSProperties | undefined = colors
          ? {
              backgroundColor: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
            }
          : undefined;

        return (
          <button
            key={num}
            className={styles.keyButton}
            style={customStyle}
            onClick={() => onNumberClick(num)}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
};
