import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { client } from '../../sanityClient';
import { useAuth } from '../../contexts/AuthContext';
import styles from './MyOrdersPage.module.css';

const MyOrdersPage = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            const fetchOrders = async () => {
                const query = `*[_type == "foodOrder" && customerEmail == $email] | order(createdAt desc)`;
                const data = await client.fetch(query, { email: currentUser.email });
                setOrders(data);
                setLoading(false);
            };
            fetchOrders();
        }
    }, [currentUser]);

    if (loading) return <div className="page-wrapper container"><h2>Loading your orders...</h2></div>;

    return (
        <div className={`${styles.ordersPage} page-wrapper container`}>
            <h1>My Orders</h1>
            {orders.length > 0 ? (
                <div className={styles.ordersList}>
                    {orders.map(order => (
                        <Link to={`/order-status/${order._id}`} key={order._id} className={styles.orderCard}>
                            <div>
                                <span className={styles.orderId}>Order #{order._id.slice(-6)}</span>
                                <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <span className={styles.orderTotal}>Rs. {order.grandTotal.toFixed(2)}</span>
                            <span className={`${styles.statusBadge} ${styles[order.orderStatus]}`}>{order.orderStatus}</span>
                        </Link>
                    ))}
                </div>
            ) : (
                <p>You haven't placed any orders yet.</p>
            )}
        </div>
    );
};

export default MyOrdersPage;