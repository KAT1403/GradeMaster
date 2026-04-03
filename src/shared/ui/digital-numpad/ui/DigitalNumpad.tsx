import styles from './DigitalNumpad.module.scss';

interface DigitalNumpadProps {
  onNumberClick: (num: number) => void;
}

export const DigitalNumpad = ({ onNumberClick }: DigitalNumpadProps) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className={styles.grid}>
      {numbers.map((num) => (
        <button
          key={num}
          className={styles.keyButton}
          onClick={() => onNumberClick(num)}
        >
          {num}
        </button>
      ))}
    </div>
  );
};
