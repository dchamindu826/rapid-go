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
                // Query eka update kala schema ekata anuwa (deliveryCharge)
                const query = `*[_type == "foodOrder" && customerEmail == $email] | order(_createdAt desc){
                    _id,
                    foodTotal,
                    deliveryCharge,
                    grandTotal,
                    orderStatus,
                    "createdAt": _createdAt,
                    orderedItems[]{
                        quantity,
                        "name": item->name,
                        "categoryName": item->category->title
                    }
                }`;
                try {
                    const data = await client.fetch(query, { email: currentUser.email });
                    setOrders(data);
                } catch (error) {
                    console.error("Error fetching orders:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }
    }, [currentUser]);

    if (loading) return <div className="page-wrapper container" style={{textAlign: 'center', padding: '100px'}}><h2>Loading your orders...</h2></div>;

    return (
        <div className={`${styles.ordersPage} page-wrapper container`}>
            <h1 className={styles.pageTitle}>My Orders</h1>
            {orders.length > 0 ? (
                <div className={styles.ordersList}>
                    {orders.map(order => (
                        <Link to={`/order-status/${order._id}`} key={order._id} className={styles.orderCard}>
                            <div className={styles.cardMain}>
                                <div className={styles.orderIdentity}>
                                    <span className={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</span>
                                    <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>

                                <div className={styles.itemsList}>
                                    {order.orderedItems?.map((item, i) => (
                                        <div key={i} className={styles.itemRow}>
                                            <span className={styles.categoryTag}>{item.categoryName || 'Food'}</span>
                                            <span className={styles.itemName}>{item.name} x {item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.priceBreakdown}>
                                    <div className={styles.priceLine}>
                                        <span>Items Total:</span>
                                        <span>Rs. {(order.foodTotal || 0).toFixed(2)}</span>
                                    </div>
                                    <div className={styles.priceLine}>
                                        {/* Schema ekata anuwa deliveryCharge use kala */}
                                        <span className={styles.courierLabel}>Courier Charge:</span>
                                        <span className={styles.courierValue}>Rs. {(order.deliveryCharge || 0).toFixed(2)}</span>
                                    </div>
                                    <div className={styles.totalLine}>
                                        <span>Grand Total:</span>
                                        <span className={styles.orderTotal}>Rs. {(order.grandTotal || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardStatus}>
                                <span className={`${styles.statusBadge} ${styles[order.orderStatus?.toLowerCase() || 'pending']}`}>
                                    {order.orderStatus}
                                </span>
                                <span className={styles.viewDetails}>View Tracking →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}><p>No orders found.</p></div>
            )}
        </div>
    );
};

export default MyOrdersPage;