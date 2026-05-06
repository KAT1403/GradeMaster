import { HelpCircle } from 'lucide-react';
import styles from './InfoTooltip.module.scss';

interface InfoTooltipProps {
  content: string;
}

export const InfoTooltip = ({ content }: InfoTooltipProps) => {
  return (
    <div className={styles.tooltipWrapper}>
      <HelpCircle size={16} className={styles.helpIcon} />
      <div className={styles.tooltipContent}>
        {content}
      </div>
    </div>
  );
};
