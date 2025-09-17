import React, { useState, useEffect } from 'react';
import styles from './ProfilePage.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Firestore import
import { client } from '../../sanityClient'; // Sanity Client import

const ProfilePage = () => {
    const { currentUser } = useAuth();
    const [profileData, setProfileData] = useState({ firstName: '', lastName: '', phone: '', address: '' });
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                // Fetch user profile data from Firestore using their unique UID
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setProfileData(userDoc.data());
                }

                // Fetch order history from Sanity using their email
                const orderQuery = `*[_type == "order" && customerEmail == $email] | order(_createdAt desc){
                    ..., "product": orderedProduct->{name, googleDriveLink}
                }`;
                const orderParams = { email: currentUser.email };
                const orderData = await client.fetch(orderQuery, orderParams);
                setOrders(orderData);
            }
            setIsLoading(false);
        };
        fetchUserData();
    }, [currentUser]);

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

    if (isLoading) {
        return <div className="container" style={{padding: '50px', textAlign: 'center'}}><h2>Loading Profile...</h2></div>
    }

    if (!currentUser) {
        return <div className="container" style={{padding: '50px', textAlign: 'center'}}><h2>Please log in to view your profile.</h2></div>
    }

    return (
        <div className={`${styles.profilePage} container`}>
            <h1>My Profile</h1>
            <div className={styles.profileLayout}>
                <div className={styles.profileForm}>
                    <h3>Personal Information</h3>
                    <form onSubmit={handleUpdateProfile}>
                        <div className={styles.formGroup}>
                            <label>First Name</label>
                            <input type="text" name="firstName" value={profileData.firstName || ''} onChange={handleInputChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Last Name</label>
                            <input type="text" name="lastName" value={profileData.lastName || ''} onChange={handleInputChange} />
                        </div>
                         <div className={styles.formGroup}>
                            <label>Email Address</label>
                            <input type="email" value={currentUser.email || ''} disabled />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Phone Number</label>
                            <input type="tel" name="phone" value={profileData.phone || ''} onChange={handleInputChange} placeholder="e.g., 0771234567" />
                        </div>
                         <div className={styles.formGroup}>
                            <label>Billing Address</label>
                            <textarea name="address" value={profileData.address || ''} onChange={handleInputChange} rows="3" placeholder="Enter your billing address"></textarea>
                        </div>
                        <button type="submit" className={styles.updateBtn}>Update Profile</button>
                    </form>
                </div>
                <div className={styles.ordersSection}>
                    <h3>My Digital Purchases</h3>
                    <div className={styles.ordersTable}>
                        <div className={styles.tableHeader}>
                            <span>Product</span>
                            <span>Total</span>
                            <span>Status</span>
                            <span>Action</span>
                        </div>
                        {orders.length > 0 ? orders.map(order => (
                            <div key={order._id} className={styles.tableRow}>
                                <span>{order.product?.name || 'N/A'}</span>
                                <span>Rs. {order.totalAmount.toFixed(2)}</span>
                                <td><span className={`${styles.status} ${styles[order.paymentStatus]}`}>{order.paymentStatus}</span></td>
                                <td>
                                    {order.paymentStatus === 'Approved' ? (
                                        <a href={order.product?.googleDriveLink} target="_blank" rel="noopener noreferrer" className={styles.downloadBtn}>
                                            Download
                                        </a>
                                    ) : (
                                        <button className={styles.downloadBtn} disabled>Download</button>
                                    )}
                                </td>
                            </div>
                        )) : <p className={styles.noOrders}>You have no orders yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;