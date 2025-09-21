import React, { useState, useEffect, useCallback } from 'react';
import styles from './TrackingPage.module.css';
import { useSearchParams } from 'react-router-dom';
// ✅ WENAS KAMA: 'client' kiyana eka { } warahan athulata damma
import { client } from '../../sanityClient'; 
import { FiPackage, FiTruck, FiCheckCircle, FiHome, FiXCircle, FiRefreshCw } from 'react-icons/fi';

const STATUS_STEPS = [
    { status: 'Pending', icon: <FiPackage />, text: 'Parcel data received, awaiting pickup.' },
    { status: 'In Transit', icon: <FiTruck />, text: 'Parcel is on its way to the destination hub.' },
    { status: 'On the way', icon: <FiHome />, text: 'Out for delivery today.' },
    { status: 'Delivered', icon: <FiCheckCircle />, text: 'Successfully delivered.' },
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
            const query = `*[_type == "parcel" && trackingNumber == $trackingNumber][0]`;
            const params = { trackingNumber: idToSearch };
            const data = await client.fetch(query, params);
            if (data) {
                setParcelData(data);
            } else {
                setError('Invalid Tracking Number. Please check and try again.');
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
        const query = `*[_type == "parcel" && _id == $parcelId]`;
        const params = { parcelId: parcelData._id };
        const subscription = client.listen(query, params).subscribe(update => {
            setParcelData(update.result);
        });
        return () => subscription.unsubscribe();
    }, [parcelData?._id]);

    const getStatusIndex = (status) => {
        const index = STATUS_STEPS.findIndex(step => step.status === status);
        if (status === 'Returned' || status === 'Rescheduled') return -2; 
        return index;
    };

    const currentStatusIndex = parcelData ? getStatusIndex(parcelData.status) : -1;

    return (
        <div className={`${styles.pageContainer} container`}>
            <div className="page-wrapper container"></div>
            <div className={styles.searchSection}>
                <h1>Track Your Parcel</h1>
                <p className={styles.subtitle}>Enter your tracking number to see the live progress of your delivery.</p>
                <form className={styles.searchBar} onSubmit={(e) => { e.preventDefault(); handleSearch(trackingNumber); }}>
                    <input 
                        type="text" 
                        placeholder="e.g., RG12345678" 
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
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
                    <h2>Order Status: <span className={styles.currentStatus}>{parcelData.status}</span></h2>
                    
                    <div className={styles.timeline}>
                        {parcelData.status === 'Returned' && (
                             <div className={`${styles.noticeBox} ${styles.returned}`}>
                                <FiXCircle />
                                <div><h3>Parcel Returned</h3><p>The parcel could not be delivered.</p></div>
                            </div>
                        )}
                        {parcelData.status === 'Rescheduled' && (
                            <div className={`${styles.noticeBox} ${styles.rescheduled}`}>
                                <FiRefreshCw />
                                <div>
                                    <h3>Delivery Rescheduled</h3>
                                    {parcelData.newDeliveryDate && <p>New Date: {parcelData.newDeliveryDate}</p>}
                                    {parcelData.deliveryNotes && <span className={styles.timestamp}>Note: {parcelData.deliveryNotes}</span>}
                                </div>
                            </div>
                        )}

                        {STATUS_STEPS.map((item, index) => (
                            <div 
                                key={index} 
                                className={`${styles.timelineItem} ${index <= currentStatusIndex ? styles.completed : ''}`}
                            >
                                <div className={styles.timelineIcon}>{item.icon}</div>
                                <div className={styles.timelineContent}>
                                    <h3>{item.status}</h3>
                                    <p>{item.text}</p>
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