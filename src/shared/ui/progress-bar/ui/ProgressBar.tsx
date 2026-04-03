import styles from './ProgressBar.module.scss';

interface ProgressBarProps {
  percent: number;
  label?: string;
  color?: string;
}

export const ProgressBar = ({ percent, label, color = '#3b82f6' }: ProgressBarProps) => {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);

  return (
    <div className={styles.wrapper}>
      <div className={styles.info}>
        {label && <span className={styles.label}>{label}</span>}
        <span className={styles.value}>{clampedPercent.toFixed(1)}%</span>
      </div>
      <div className={styles.track}>
        <div 
          className={styles.fill} 
          style={{ width: `${clampedPercent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};
