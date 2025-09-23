import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { client } from '../../sanityClient';
import styles from './OrderStatusPage.module.css';
import { Clock, RefreshCw, Truck, CheckCircle, XCircle, MapPin } from 'lucide-react';

const OrderStatusPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const query = `*[_type == "foodOrder" && _id == $orderId][0]{..., "restaurant": restaurant->{name}}`;
        const fetchOrder = async () => {
            const data = await client.fetch(query, { orderId });
            setOrder(data);
            setLoading(false);
        };
        fetchOrder();

        const subscription = client.listen(`*[_id == "${orderId}"]`).subscribe(update => {
            setOrder(prevOrder => ({ ...prevOrder, ...update.result }));
        });
        return () => subscription.unsubscribe();
    }, [orderId]);

    if (loading) return <div className="page-wrapper container"><h2>Loading Your Order Status...</h2></div>;
    if (!order) return <div className="page-wrapper container"><h2>Order Not Found</h2></div>;

    // The defined steps of the order process
    const statuses = [
        { key: 'pending', label: 'Order Placed', icon: <Clock/> },
        { key: 'preparing', label: 'Preparing', icon: <RefreshCw/> },
        { key: 'onTheWay', label: 'On The Way', icon: <Truck/> },
        { key: 'nearDestination', label: 'Near Destination', icon: <MapPin/> },
        { key: 'completed', label: 'Delivered', icon: <CheckCircle/> },
    ];
    
    // Find the index of the current status
    const currentStatusIndex = statuses.findIndex(s => s.key === order.orderStatus);

    return (
        <div className={`${styles.statusPage} page-wrapper container`}>
            <div className={styles.statusBox}>
                <h1>Order Status</h1>
                <p>Order #{order._id.slice(-6).toUpperCase()} from <strong>{order.restaurant?.name}</strong></p>

                {order.orderStatus === 'cancelled' ? (
                    <div className={styles.cancelled}>
                        <XCircle size={48} />
                        <h2>Order Cancelled</h2>
                    </div>
                ) : (
                    <div className={styles.timeline}>
                        {statuses.map((status, index) => (
                            <div 
                                key={status.key} 
                                // Apply 'active' class if the order has reached or passed this step
                                className={`${styles.statusPoint} ${index <= currentStatusIndex ? styles.active : ''}`}
                            >
                                <div className={styles.icon}>{status.icon}</div>
                                <div className={styles.label}>{status.label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderStatusPage;