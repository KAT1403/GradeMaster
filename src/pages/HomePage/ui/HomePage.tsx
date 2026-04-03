import { HeaderWidget } from '../../../widget/header';
import styles from './HomePage.module.scss';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <HeaderWidget />
      <main className={styles.mainContent}>
        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
          Контент вкладки...
        </div>
      </main>
    </div>
  );
}