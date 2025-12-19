import React, { useState, useEffect, useCallback } from 'react';
import styles from './TrackingPage.module.css';
import { useSearchParams } from 'react-router-dom';
import { client } from '../../sanityClient';
import { 
    FiPackage, FiTruck, FiCheckCircle, FiHome, 
    FiXCircle, FiRefreshCw, FiClock, FiUser, FiShoppingBag 
} from 'react-icons/fi';

const STATUS_STEPS = [
    { key: 'pending', status: 'Order Received', icon: <FiPackage />, text: 'Order received, awaiting restaurant confirmation.' },
    { key: 'preparing', status: 'Preparing Food', icon: <FiShoppingBag />, text: 'Restaurant is preparing your food.' },
    { key: 'readyForPickup', status: 'Food Ready', icon: <FiClock />, text: 'Food is ready for pickup.' },
    { key: 'assigned', status: 'Rider Assigned', icon: <FiUser />, text: 'A rider has been assigned to your order.' },
    { key: 'onTheWay', status: 'On the Way', icon: <FiTruck />, text: 'Rider is on the way to your location.' },
    { key: 'completed', status: 'Delivered', icon: <FiCheckCircle />, text: 'Successfully delivered. Enjoy your meal!' },
];

const TrackingPage = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [parcelData, setParcelData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();

    const handleSearch = useCallback(async (idToSearch) => {
        if (!idToSearch) return;
        setIsLoading(true);
        setError('');
        setParcelData(null);
        
        try {
            const query = `*[_type == "foodOrder" && _id == $trackingNumber][0]{
                _id,
                orderStatus,
                receiverName,
                preparationTime,
                _createdAt,
                statusUpdates,
                "restaurantName": restaurant->name,
                "items": orderedItems[]{ "name": @.item->name, "quantity": @.quantity }
            }`;
            
            const params = { trackingNumber: idToSearch };
            const data = await client.fetch(query, params);
            
            if (data) {
                setParcelData(data);
            } else {
                setError('Invalid Order ID. Please check and try again.');
            }
        } catch (err) {
            console.error("Tracking failed:", err);
            setError('An error occurred while fetching data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const urlTrackingId = searchParams.get('id');
        if (urlTrackingId) {
            setTrackingNumber(urlTrackingId);
            handleSearch(urlTrackingId);
        }
    }, [searchParams, handleSearch]);

    useEffect(() => {
        if (!parcelData?._id) return;
        const query = `*[_type == "foodOrder" && _id == $orderId]`;
        const params = { orderId: parcelData._id };
        const subscription = client.listen(query, params).subscribe(update => {
            if (update.result) { handleSearch(parcelData._id); }
        });
        return () => subscription.unsubscribe();
    }, [parcelData?._id, handleSearch]);

    const formatTime = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getCurrentStepIndex = (status) => {
        if (status === 'cancelled' || status === 'returned') return -1;
        return STATUS_STEPS.findIndex(step => step.key === status);
    };

    const currentStatusIndex = parcelData ? getCurrentStepIndex(parcelData.orderStatus) : -1;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.searchSection}>
                <h1>Track Your Food Order</h1>
                <p className={styles.subtitle}>Enter your Order ID to see live updates.</p>
                <form className={styles.searchBar} onSubmit={(e) => { e.preventDefault(); handleSearch(trackingNumber); }}>
                    <input 
                        type="text" 
                        placeholder="Enter Order ID..." 
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Searching...' : 'Track'}
                    </button>
                </form>
            </div>

            {isLoading && <div className={styles.loader}></div>}
            {error && <div className={styles.error}>{error}</div>}
            
            {parcelData && (
                <div className={styles.resultsSection}>
                    <h2>Order Status: <span className={styles.currentStatus}>{parcelData.orderStatus.toUpperCase()}</span></h2>
                    
                    <div className={styles.timeline}>
                        {/* Cancelled State using noticeBox style from your CSS */}
                        {parcelData.orderStatus === 'cancelled' && (
                             <div className={`${styles.noticeBox} ${styles.returned}`}>
                                <FiXCircle />
                                <div>
                                    <h3>Order Cancelled</h3>
                                    <p>This order has been cancelled by the restaurant or user.</p>
                                </div>
                            </div>
                        )}

                        {/* Status Steps */}
                        {STATUS_STEPS.map((step, index) => {
                            const updateInfo = parcelData.statusUpdates?.find(u => u.status === step.key);
                            const isCompleted = index <= currentStatusIndex;

                            return (
                                <div 
                                    key={step.key} 
                                    className={`${styles.timelineItem} ${isCompleted ? styles.completed : ''}`}
                                >
                                    <div className={styles.timelineIcon}>{step.icon}</div>
                                    <div className={styles.timelineContent}>
                                        <h3>{step.status}</h3>
                                        <p>{step.text}</p>
                                        {updateInfo && (
                                            <span className={styles.timestamp}>Updated at: {formatTime(updateInfo.timestamp)}</span>
                                        )}
                                        {/* Prep Time logic embedded in Content */}
                                        {step.key === 'preparing' && index === currentStatusIndex && parcelData.preparationTime && (
                                            <p style={{color: 'var(--secondary-accent)', fontWeight: 'bold', marginTop: '5px'}}>
                                                Estimated Prep Time: {parcelData.preparationTime} mins
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackingPage;