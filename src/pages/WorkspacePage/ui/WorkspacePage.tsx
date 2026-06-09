import { CalculatorWidget } from "../../../widget/calculator";
import styles from "./WorkspacePage.module.scss";

export default function WorkspacePage() {
  return (
    <div className={styles.container}>
      <CalculatorWidget />
    </div>
  );
}
