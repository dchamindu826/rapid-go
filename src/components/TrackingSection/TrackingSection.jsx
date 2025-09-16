import React from 'react';
import styles from './TrackingSection.module.css';

const TrackingSection = () => (
    <section className={styles.trackingSection}>
        <div className="container">
            <div className={styles.trackingBox}>
                {/* Image path eka oya dapu aluth thanata wenas kara */}
                <img src="/images/icons/tracking-icon.png" className={styles.trackingIcon} />
                <h2>Track Your Order</h2>
                <p>Enter your tracking number below to see the real-time status.</p>
                <div className={styles.trackingInputGroup}>
                    <input type="text" placeholder="Enter tracking number..." />
                    <button className={styles.btnTrack}>Track</button>
                </div>
            </div>
        </div>
    </section>
);

export default TrackingSection;