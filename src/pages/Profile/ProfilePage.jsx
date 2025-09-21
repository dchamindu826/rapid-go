import React, { useState, useEffect, useCallback } from 'react';
import styles from './ProfilePage.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { client, urlFor } from '../../sanityClient'; // <-- WENAS KAMA MEHI THIBE (CHANGE IS HERE)

const ProfilePage = () => {
    const { currentUser } = useAuth();
    const [profileData, setProfileData] = useState({ firstName: '', lastName: '', phone: '', address: '' });
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAllData = useCallback(async () => {
        if (!currentUser) return;

        setIsLoading(true);

        // Fetch user data from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            setProfileData(userDoc.data());
        }

        // Fetch order data from Sanity
        const orderQuery = `*[_type == "order" && customerEmail == $email] | order(orderedAt desc){
            _id, orderAmount, orderStatus, orderedAt, items
        }`;
        const orderParams = { email: currentUser.email };
        const orderData = await client.fetch(orderQuery, orderParams);
        
        setOrders(orderData);
        setIsLoading(false);

    }, [currentUser]);


    useEffect(() => {
        if (!currentUser) {
            setIsLoading(false);
            return;
        }
        
        fetchAllData();

        // Set up real-time listener for orders
        const query = `*[_type == "order" && customerEmail == $email]`;
        const params = { email: currentUser.email };

        const subscription = client.listen(query, params).subscribe(update => {
            // Refetch all data on any change for consistency
            fetchAllData();
        });

        return () => {
            subscription.unsubscribe();
        };

    }, [currentUser, fetchAllData]);

    const handleInputChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (currentUser) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            try {
                await updateDoc(userDocRef, profileData);
                alert('Profile updated successfully!');
            } catch (error) {
                console.error("Error updating profile: ", error);
                alert('Failed to update profile.');
            }
        }
    };

    if (isLoading && orders.length === 0) {
        return <div className="container" style={{padding: '50px', textAlign: 'center'}}><h2>Loading Profile...</h2></div>
    }

    if (!currentUser) {
        return <div className="container" style={{padding: '50px', textAlign: 'center'}}><h2>Please log in to view your profile.</h2></div>
    }

    return (
        <div className={`${styles.profilePage} container`}>
            <div className="page-wrapper container"></div>
            <h1>My Profile</h1>
            <div className={styles.profileLayout}>
                <div className={styles.profileForm}>
                    <h3>Personal Information</h3>
                    <form onSubmit={handleUpdateProfile}>
                        <div className={styles.formGroup}><label>First Name</label><input type="text" name="firstName" value={profileData.firstName || ''} onChange={handleInputChange} /></div>
                        <div className={styles.formGroup}><label>Last Name</label><input type="text" name="lastName" value={profileData.lastName || ''} onChange={handleInputChange} /></div>
                        <div className={styles.formGroup}><label>Email Address</label><input type="email" value={currentUser.email || ''} disabled /></div>
                        <div className={styles.formGroup}><label>Phone Number</label><input type="tel" name="phone" value={profileData.phone || ''} onChange={handleInputChange} placeholder="e.g., 0771234567" /></div>
                        <div className={styles.formGroup}><label>Billing Address</label><textarea name="address" value={profileData.address || ''} onChange={handleInputChange} rows="3" placeholder="Enter your billing address"></textarea></div>
                        <button type="submit" className={styles.updateBtn}>Update Profile</button>
                    </form>
                </div>
                <div className={styles.ordersSection}>
                    <h3>My Digital Purchases</h3>
                    <div className={styles.ordersTable}>
                        <div className={styles.tableHeader}>
                            <span>Product(s)</span>
                            <span>Total</span>
                            <span>Status</span>
                            <span>Action</span>
                        </div>
                        {isLoading && orders.length === 0 ? (
                            <p className={styles.noOrders}>Checking for your orders...</p>
                        ) : orders.length > 0 ? orders.map(order => (
                            <div key={order._id} className={styles.tableRow}>
                                <span>{order.items?.map(item => item.productName).join(', ') || 'N/A'}</span>
                                <span>Rs. {order.orderAmount ? order.orderAmount.toFixed(2) : '0.00'}</span>
                                <span><span className={`${styles.status} ${styles[order.orderStatus]}`}>{order.orderStatus}</span></span>
                                <span>
                                    {order.orderStatus === 'approved' ? (
                                        <a href={"#"} target="_blank" rel="noopener noreferrer" className={styles.downloadBtn}>
                                            Download
                                        </a>
                                    ) : (
                                        <button className={styles.downloadBtn} disabled>Download</button>
                                    )}
                                </span>
                            </div>
                        )) : (
                            <p className={styles.noOrders}>You have no orders yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;