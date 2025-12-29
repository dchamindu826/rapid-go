import React, { useState, useEffect, useCallback } from 'react';
import styles from './TrackingPage.module.css';
import { useSearchParams } from 'react-router-dom';
import { client } from '../../sanityClient';
import { 
    FiPackage, FiTruck, FiCheckCircle, 
    FiClock, FiUser, FiShoppingBag 
} from 'react-icons/fi';

const STATUS_STEPS = [
    { key: 'pending', status: 'Order Placed', icon: <FiPackage />, text: "We've received your order." },
    { key: 'preparing', status: 'Preparing Food', icon: <FiShoppingBag />, text: 'The restaurant is preparing your food.' },
    { key: 'readyForPickup', status: 'Ready for Pickup', icon: <FiClock />, text: 'Your order is ready to be collected.' },
    { key: 'assigned', status: 'Rider Assigned', icon: <FiUser />, text: 'A rider is on the way to the restaurant.' },
    { key: 'onTheWay', status: 'On the Way', icon: <FiTruck />, text: 'Your rider is bringing your order.' },
    { key: 'completed', status: 'Delivered', icon: <FiCheckCircle />, text: 'Enjoy your meal!' },
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
        
        try {
            // GROQ Query එකෙන් preparationTime එක පැහැදිලිවම ගන්නවා
            const query = `*[_type == "foodOrder" && _id == $trackingNumber][0]{
                _id,
                orderStatus,
                preparationTime,
                statusUpdates,
                "restaurantName": restaurant->name
            }`;
            
            const data = await client.fetch(query, { trackingNumber: idToSearch });
            
            if (data) {
                setParcelData(data);
            } else {
                setError('Invalid Order ID.');
                setParcelData(null);
            }
        } catch (err) {
            setError('Fetch error.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) { setTrackingNumber(id); handleSearch(id); }
    }, [searchParams, handleSearch]);

    // Real-time updates සඳහා listener එක
    useEffect(() => {
        if (!parcelData?._id) return;
        const subscription = client.listen(
            `*[_type == "foodOrder" && _id == $orderId]`, 
            { orderId: parcelData._id }
        ).subscribe((update) => {
            // Document එකේ ඕනෑම වෙනසක් වුනොත් ආයෙත් fetch කරනවා
            handleSearch(parcelData._id); 
        });
        return () => subscription.unsubscribe();
    }, [parcelData?._id, handleSearch]);

    const formatTime = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const currentStatusIndex = parcelData ? STATUS_STEPS.findIndex(s => s.key === parcelData.orderStatus) : -1;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.searchSection}>
                <h1>Track Your Order</h1>
                <form className={styles.searchBar} onSubmit={(e) => { e.preventDefault(); handleSearch(trackingNumber); }}>
                    <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Order ID..." />
                    <button type="submit">Track</button>
                </form>
            </div>

            {parcelData && (
                <div className={styles.resultsSection}>
                    <div className={styles.orderHeader}>
                        <h2>Order ID: <span className={styles.orderId}>#{parcelData._id.slice(-6).toUpperCase()}</span></h2>
                    </div>

                    <div className={styles.timeline}>
                        {STATUS_STEPS.map((step, index) => {
                            const updateInfo = parcelData.statusUpdates?.find(u => u.status === step.key);
                            const isCompleted = index <= currentStatusIndex;
                            const isCurrent = index === currentStatusIndex;

                            return (
                                <div key={step.key} className={`${styles.timelineItem} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.activeStep : ''}`}>
                                    <div className={styles.timelineIcon}>{step.icon}</div>
                                    <div className={styles.timelineContent}>
                                        <div className={styles.stepHeader}>
                                            <h3>{step.status}</h3>
                                            
                                            {/* ප්‍රධාන වෙනස: Preparing step එකේදී ඇස්තමේන්තුගත කාලය පෙන්වීම */}
                                            {step.key === 'preparing' && parcelData.preparationTime ? (
                                                <span className={styles.stepTime}>
                                                    {parcelData.preparationTime} MINS
                                                </span>
                                            ) : updateInfo ? (
                                                <span className={styles.stepTime}>
                                                    {formatTime(updateInfo.timestamp)}
                                                </span>
                                            ) : null}
                                        </div>
                                        <p>{step.text}</p>
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