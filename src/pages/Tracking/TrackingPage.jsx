import React, { useState, useEffect } from 'react';
import styles from './TrackingPage.module.css';
import { useSearchParams } from 'react-router-dom'; // useSearchParams import kara
import { FiPackage, FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi';

const mockOrderData = {
    'RG12345678': {
        trackingNumber: 'RG12345678',
        itemName: 'Corporate Slideshow Pack',
        status: 'In Transit',
        history: [
            { status: 'Order Placed', location: 'Colombo', timestamp: 'Sep 16, 2025, 10:30 AM', icon: <FiPackage /> },
            { status: 'Processing', location: 'Colombo Warehouse', timestamp: 'Sep 16, 2025, 11:00 AM', icon: <FiClock /> },
            { status: 'Dispatched', location: 'Colombo Warehouse', timestamp: 'Sep 17, 2025, 09:00 AM', icon: <FiTruck /> },
            { status: 'In Transit', location: 'On the way to Kandy', timestamp: 'Sep 17, 2025, 11:30 AM', icon: <FiTruck /> },
        ]
    },
    'RG87654321': {
        trackingNumber: 'RG87654321',
        itemName: 'Cinematic Lightroom Presets',
        status: 'Delivered',
        history: [
            { status: 'Order Placed', location: 'Galle', timestamp: 'Sep 15, 2025, 02:00 PM', icon: <FiPackage /> },
            { status: 'Dispatched', location: 'Galle Hub', timestamp: 'Sep 15, 2025, 05:00 PM', icon: <FiTruck /> },
            { status: 'Delivered', location: 'Delivered', timestamp: 'Sep 16, 2025, 10:00 AM', icon: <FiCheckCircle /> },
        ]
    }
};

const TrackingPage = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams(); // URL eke parameters ganna

    // Search function eka wenama haduwa
    const handleSearch = (id) => {
        setIsLoading(true);
        setError('');
        setOrderData(null);
        
        setTimeout(() => {
            const foundOrder = mockOrderData[id];
            if (foundOrder) {
                setOrderData(foundOrder);
            } else {
                setError('Invalid Tracking Number. Please check and try again.');
            }
            setIsLoading(false);
        }, 1000);
    };

    // Page eka load weddi, URL eke ID ekak thiyenawada balala auto-search karanawa
    useEffect(() => {
        const urlTrackingId = searchParams.get('id');
        if (urlTrackingId) {
            setTrackingNumber(urlTrackingId);
            handleSearch(urlTrackingId);
        }
    }, [searchParams]);
    
    const currentStatusIndex = orderData ? orderData.history.findIndex(item => item.status === orderData.status) : -1;

    return (
        <div className={`${styles.pageContainer} container`}>
            <div className={styles.searchSection}>
                <h1>Track Your Parcel</h1>
                <p className={styles.subtitle}>Enter your tracking number to see the live progress of your delivery.</p>
                <div className={styles.searchBar}>
                    <input 
                        type="text" 
                        placeholder="e.g., RG12345678" 
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                    <button onClick={() => handleSearch(trackingNumber)} disabled={isLoading}>
                        {isLoading ? 'Searching...' : 'Track'}
                    </button>
                </div>
            </div>

            {isLoading && <div className={styles.loader}></div>}
            {error && <div className={styles.error}>{error}</div>}
            
            {orderData && (
                <div className={styles.resultsSection}>
                    <h2>Order Status: <span className={styles.currentStatus}>{orderData.status}</span></h2>
                    <div className={styles.timeline}>
                        {orderData.history.map((item, index) => (
                            <div 
                                key={index} 
                                className={`${styles.timelineItem} ${index <= currentStatusIndex ? styles.completed : ''}`}
                            >
                                <div className={styles.timelineIcon}>{item.icon}</div>
                                <div className={styles.timelineContent}>
                                    <h3>{item.status}</h3>
                                    <p>{item.location}</p>
                                    <span className={styles.timestamp}>{item.timestamp}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackingPage;