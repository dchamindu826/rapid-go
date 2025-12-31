import React from 'react';
import styles from './DownloadApps.module.css';
import Header from '../../components/Header/Header';

// Images assets walin import karaganna
import partnerImg from '../../assets/partnership.jpg'; 
import riderImg from '../../assets/app-page.jpg'; 

const DownloadApps = () => {
  return (
    <div className={styles.pageWrapper}>
      <Header />
      
      <div className={styles.heroSection}>
        <div className="container">
          <span className={styles.topBadge}>Mobile Experience</span>
          <h1>RapidGo <span>Ecosystem</span></h1>
          <p className={styles.heroSubtitle}>Join our growing network. Download the right app for your needs.</p>
        </div>
      </div>

      <main className="container">
        <div className={styles.appGrid}>
          
          {/* Card 1: Restaurant Partner */}
          <div className={styles.postCard}>
            <div className={styles.imageBox}>
              <img src={partnerImg} alt="RapidGo Partner" className={styles.roundedImg} />
            </div>
            <div className={styles.contentBox}>
              <span className={styles.cardLabel}>For Restaurants</span>
              <h2>Partner Dashboard</h2>
              <p>Everything you need to grow your restaurant business. Manage orders and menus in real-time.</p>
              <ul className={styles.keyPoints}>
                <li><span>✓</span> Live Order Management</li>
                <li><span>✓</span> Menu & Inventory Control</li>
                <li><span>✓</span> Detailed Sales Analytics</li>
              </ul>
              {/* Button click kala gaman download wenawa */}
              <a href="https://drive.google.com/file/d/1-aECjm8Ed_SfwBWcKNZTVL16_HzYYgzC/view?usp=drivesdk" download="RapidGo_Partner.apk" className={styles.downloadBtn}>
                Download APK
              </a>
            </div>
          </div>

          {/* Card 2: Rider Partner */}
          <div className={styles.postCard}>
            <div className={styles.imageBox}>
              <img src={riderImg} alt="RapidGo Rider" className={styles.roundedImg} />
            </div>
            <div className={styles.contentBox}>
              <span className={styles.cardLabel}>For Riders</span>
              <h2>Rider Partner App</h2>
              <p>Be your own boss. Flexible hours and daily earnings tracker with smart navigation.</p>
              <ul className={styles.keyPoints}>
                <li><span>✓</span> Real-time Delivery Alerts</li>
                <li><span>✓</span> Smart GPS Navigation</li>
                <li><span>✓</span> Daily Earnings Tracker</li>
              </ul>
              <a href="https://drive.google.com/file/d/1Cdo77w437hymMFX9WqWe7G22Q06Z0KhC/view?usp=drivesdk" download="RapidGo_Rider.apk" className={styles.downloadBtn}>
                Download APK
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DownloadApps;