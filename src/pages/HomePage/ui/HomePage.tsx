import { HeaderWidget } from '../../../widget/header';
import { CalculatorWidget } from '../../../widget/calculator';
import { useUIStore } from '../../../app/store/uiStore';
import styles from './HomePage.module.scss';

export default function HomePage() {
  const activeTab = useUIStore((state) => state.activeTab);

  return (
    <div className={styles.container}>
      <HeaderWidget />
      <main className={styles.mainContent}>
        {activeTab === 'calculator' && <CalculatorWidget />}
        {activeTab === 'predictor' && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
            Вкладка Прогноз в разработке...
          </div>
        )}
        {activeTab === 'analytics' && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
            Вкладка Аналитика в разработке...
          </div>
        )}
      </main>
    </div>
  );
}