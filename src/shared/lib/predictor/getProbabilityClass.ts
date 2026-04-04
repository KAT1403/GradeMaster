import styles from '../../../widget/predictor/ui/PredictorWidget.module.scss';

export const getProbabilityClass = (level: 'high' | 'medium' | 'low'): string => {
  switch (level) {
    case 'high':
      return styles.probHigh;
    case 'medium':
      return styles.probMedium;
    case 'low':
      return styles.probLow;
    default:
      return styles.probLow;
  }
};
