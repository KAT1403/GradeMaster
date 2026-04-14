import { HeaderWidget } from '../../../widget/header';
import { CalculatorWidget } from '../../../widget/calculator';
import { useUIStore } from '../../../app/store/uiStore';
import { PredictorWidget } from '../../../widget/predictor';
import { AnalyticsWidget } from '../../../widget/analytics';
import styles from './HomePage.module.scss';

export default function HomePage() {
  const activeTab = useUIStore((state) => state.activeTab);

  return (
    <div className={styles.container}>
      <HeaderWidget />
      <main className={styles.mainContent}>
        {activeTab === 'calculator' && <CalculatorWidget />}
        {activeTab === 'predictor' && <PredictorWidget />}
        {activeTab === 'analytics' && <AnalyticsWidget />}
      </main>
    </div>
  );
}