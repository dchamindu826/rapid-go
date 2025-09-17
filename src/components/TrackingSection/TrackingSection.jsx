import React, { useState } from 'react';
import styles from './TrackingSection.module.css';
import { useNavigate } from 'react-router-dom'; // useNavigate import kara

const TrackingSection = () => {
    const [trackingInput, setTrackingInput] = useState('');
    const navigate = useNavigate(); // useNavigate hook eka use kara

    const handleTrack = () => {
        if (trackingInput.trim()) {
            // Tracking page ekata, ID eka ekkama redirect karanawa
            navigate(`/tracking?id=${trackingInput}`);
        }
    };
    
    // Enter key eka press kalama track wenna
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleTrack();
        }
    };

  return (
    <section className={styles.trackingSection}>
        <div className="container">
            <div className={styles.trackingBox}>
                <img src="/images/icons/tracking-icon.png" alt="tracking icon" className={styles.trackingIcon} />
                <h2>Track Your Order</h2>
                <p>Enter your tracking number below to see the real-time status.</p>
                <div className={styles.trackingInputGroup}>
                    <input 
                        type="text" 
                        placeholder="Enter tracking number..."
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button onClick={handleTrack} className={styles.btnTrack}>Track</button>
                </div>
            </div>
        </div>
    </section>
  );
};

export default TrackingSection;