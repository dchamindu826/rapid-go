import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../../sanityClient';
import { useFoodCart } from '../../contexts/FoodCartContext';
import { useAuth } from '../../contexts/AuthContext';
import MapPickerModal from './MapPickerModal'; // <-- Map Component එක import කලා
import styles from './MenuPage.module.css';
import { X, MapPin, CreditCard } from 'lucide-react';

const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const calculateDeliveryCharge = (distance) => {
    if (distance <= 5) return 220;
    if (distance <= 10) return 350;
    return 350 + (Math.ceil(distance - 10) * 50);
};

export default function CheckoutModal({ restaurant, onClose }) {
    const { cartItems, cartTotal, clearCart } = useFoodCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: currentUser?.displayName || '', phone: '', notes: '' });
    const [userLocation, setUserLocation] = useState(null);
    const [deliveryCharge, setDeliveryCharge] = useState(0);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false); // Map එකට අලුත් state එකක්

    // "Get My Location" button එකට
    const handleGetMyLocation = () => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            handleLocationSelect({ lat: latitude, lng: longitude });
        }, () => alert("Could not get your location. Please check browser permissions."));
    };

    // Map එකෙන් හෝ "Get My Location" එකෙන් location එක ආවම වැඩ කරන function එක
    const handleLocationSelect = (latlng) => {
        const { lat, lng } = latlng;
        setUserLocation({ latitude: lat, longitude: lng });
        if (restaurant.location?.lat && restaurant.location?.lng) {
            const dist = getDistance(restaurant.location.lat, restaurant.location.lng, lat, lng);
            setDeliveryCharge(calculateDeliveryCharge(dist));
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!userLocation) return alert("Please provide your delivery location.");
        setIsPlacingOrder(true);
        try {
            const newOrder = {
                _type: 'foodOrder', receiverName: formData.name, receiverContact: formData.phone,
                customerEmail: currentUser.email,
                deliveryAddress: `https://www.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`,
                notes: formData.notes, restaurant: { _type: 'reference', _ref: restaurant._id },
                foodTotal: cartTotal, deliveryCharge: deliveryCharge, grandTotal: cartTotal + deliveryCharge,
                paymentMethod: 'COD', orderStatus: 'pending', createdAt: new Date().toISOString(),
                statusUpdates: [{ _key: Math.random().toString(), status: 'pending', timestamp: new Date().toISOString() }],
                orderedItems: cartItems.map(item => ({
                    _key: `${item._id}-${Math.random()}`, item: { _type: 'reference', _ref: item._id }, quantity: item.quantity,
                })),
            };
            const createdOrder = await client.create(newOrder);
            alert('Order placed successfully!');
            clearCart();
            navigate(`/order-status/${createdOrder._id}`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <>
            {isMapOpen && <MapPickerModal onClose={() => setIsMapOpen(false)} onLocationSelect={handleLocationSelect} />}
            <div className={styles.modalBackdrop} onClick={onClose}>
                <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h2>Confirm Your Order</h2>
                        <button className={styles.closeModalBtn} onClick={onClose}><X size={24}/></button>
                    </div>
                    <form onSubmit={handlePlaceOrder} className={styles.checkoutForm}>
                        <input type="text" placeholder="Receiver Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        <input type="tel" placeholder="Contact Number" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        <textarea placeholder="Special notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                        
                        <div className={styles.locationBox}>
                             <div className={styles.locationButtons}>
                                <button type="button" onClick={handleGetMyLocation} className={styles.locationBtn}><MapPin size={16}/> Use My Current Location</button>
                                <button type="button" onClick={() => setIsMapOpen(true)} className={styles.locationBtn}><MapPin size={16}/> Choose on Map</button>
                            </div>
                            {userLocation && <div className={styles.feeDetails}><p>Delivery Fee will be: <strong>Rs. {deliveryCharge.toFixed(2)}</strong></p></div>}
                        </div>
                        
                        <div className={styles.paymentMethod}>
                            <CreditCard size={16} />
                            <span>Payment Method: <strong>Cash on Delivery (COD)</strong></span>
                        </div>

                        <div className={styles.summary}>
                            <div className={styles.summaryLine}><span>Subtotal</span><span>Rs. {cartTotal.toFixed(2)}</span></div>
                            <div className={styles.summaryLine}><span>Delivery Fee</span><span>Rs. {deliveryCharge.toFixed(2)}</span></div>
                            <div className={`${styles.summaryLine} ${styles.total}`}><span>TOTAL</span><span>Rs. {(cartTotal + deliveryCharge).toFixed(2)}</span></div>
                        </div>
                        
                        <button type="submit" className={styles.placeOrderBtn} disabled={isPlacingOrder || !userLocation}>
                            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}