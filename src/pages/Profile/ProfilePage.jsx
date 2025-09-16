import React from 'react';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
    // Demo user and order data
    const user = {
        name: 'Anusha Perera',
        email: 'anusha.p@email.com',
        img: '/images/testimonials/anusha.jpg',
    };
    const pastOrders = [
        { id: 'RG12345678', date: '2025-09-12', total: 'Rs. 1,250.00', status: 'Delivered' },
        { id: 'RG87654321', date: '2025-09-15', total: 'Rs. 780.00', status: 'Delivered' },
    ];

    return (
        <div className={`${styles.profilePage} container`}>
            <h1>My Profile</h1>
            <div className={styles.profileHeader}>
                <img src={user.img} alt={user.name} className={styles.profilePic} />
                <div className={styles.profileInfo}>
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <button className={styles.logoutBtn}>Log Out</button>
                </div>
            </div>

            <div className={styles.ordersSection}>
                <h2>Past Orders</h2>
                <div className={styles.ordersTable}>
                    <div className={styles.tableHeader}>
                        <span>Order ID</span>
                        <span>Date</span>
                        <span>Total</span>
                        <span>Status</span>
                    </div>
                    {pastOrders.map(order => (
                        <div key={order.id} className={styles.tableRow}>
                            <span>{order.id}</span>
                            <span>{order.date}</span>
                            <span>{order.total}</span>
                            <td><span className={styles.statusDelivered}>{order.status}</span></td>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;