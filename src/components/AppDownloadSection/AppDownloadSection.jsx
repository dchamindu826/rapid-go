import React from 'react';
import styles from './AppDownloadSection.module.css';

const AppDownloadSection = () => {
  return (
    <section className={styles.downloadSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Get Started with RapidGo</h2>
        <p className={styles.sectionSubtitle}>Download our dedicated apps to manage your business or start earning on the road.</p>

        <div className={styles.appGrid}>
          {/* Restaurant App Post */}
          <div className={styles.appCard}>
            <div className={styles.imageWrapper}>
              <img src="/images/partnership.jpg" alt="Restaurant Partner App" className={styles.appImage} />
            </div>
            <div className={styles.content}>
              <h3>Restaurant Partner App</h3>
              <p>Grow your business by reaching more customers. Manage orders, track deliveries, and update your menu in real-time.</p>
              <button className={styles.downloadBtn}>
                <span className={styles.icon}>📥</span> Download Partner App
              </button>
            </div>
          </div>

          {/* Rider App Post */}
          <div className={styles.appCard}>
            <div className={styles.imageWrapper}>
              <img src="/images/app-page.jpg" alt="Rider App" className={styles.appImage} />
            </div>
            <div className={styles.content}>
              <h3>Rider App</h3>
              <p>Be your own boss! Join our delivery fleet, track your earnings, and navigate efficiently with our built-in GPS tools.</p>
              <button className={`${styles.downloadBtn} ${styles.riderBtn}`}>
                <span className={styles.icon}>🏍️</span> Download Rider App
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;