import React from "react";
import styles from "./FooterWidget.module.scss";

export const FooterWidget: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={`${styles.item} ${styles.copyright}`}>
          © 2026 GradeMaster. All rights reserved.
        </div>

        <div className={`${styles.item} ${styles.license}`}>
          Released under the MIT License
        </div>

        <div className={`${styles.item} ${styles.privacy}`}>
          Data remains on your device. <strong>Privacy-first.</strong>
        </div>
      </div>
    </footer>
  );
};
