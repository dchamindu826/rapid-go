import React, { useState } from 'react';
import styles from './CheckoutPage.module.css';
import { useCart } from '../../contexts/CartContext';
import { writeClient, urlFor } from '../../sanityClient'; 
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiUpload } from 'react-icons/fi';

const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const { currentUser } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [paymentProof, setPaymentProof] = useState(null);
    const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '' });
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const navigate = useNavigate();

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) { setPaymentProof(e.target.files[0]); }
    };

    const handlePlaceOrder = async () => {
        if (!currentUser) {
            alert('Please log in to place an order.');
            return navigate('/login');
        }
        if (!customerDetails.name || !customerDetails.phone || !paymentProof) {
            alert('Please fill your name, phone number and upload the payment proof.');
            return;
        }
        setIsPlacingOrder(true);
        
        try {
            const uploadedAsset = await writeClient.assets.upload('image', paymentProof);
            
            const newOrder = {
                _type: 'order',
                customerName: customerDetails.name,
                customerEmail: currentUser.email,
                orderAmount: total,
                paymentSlip: { _type: 'image', asset: { _type: 'reference', _ref: uploadedAsset._id } },
                orderStatus: 'pending',
                orderedAt: new Date().toISOString(),
                items: cartItems.map(item => ({
                    _key: item._id,
                    productName: item.name,
                    quantity: item.quantity,
                    price: item.price
                }))
            };
            
            await writeClient.create(newOrder);
            
            clearCart();
            alert('Your order has been placed successfully!');
            navigate('/profile');

        } catch (err) {
            console.error('Order placement failed:', err);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const getImageUrl = (item) => {
        const image = item.images?.[0];
        if (image?.asset?._ref) {
          return urlFor(image).width(100).url();
        }
        return 'https://placehold.co/100x100/1E293B/E2E8F0?text=No+Image';
    };

    return (
        <div className={`${styles.checkoutPage} container`}>
            <h1>Checkout</h1>
            <div className={styles.checkoutLayout}>
                <div className={styles.customerDetails}>
                    <h2>Billing Details</h2>
                    <form className={styles.billingForm}>
                        <input type="text" name="name" placeholder="Full Name" required onChange={handleInputChange} />
                        <input type="tel" name="phone" placeholder="Phone Number" required onChange={handleInputChange} />
                    </form>

                    <h2>Payment Method</h2>
                    <div className={styles.paymentOptions}>
                        <div className={styles.option} onClick={() => setPaymentMethod('bank')}>
                            <input type="radio" id="bank" name="payment" value="bank" checked={paymentMethod === 'bank'} readOnly />
                            <label htmlFor="bank">Bank Transfer</label>
                        </div>
                        <div className={styles.option} onClick={() => setPaymentMethod('crypto')}>
                            <input type="radio" id="crypto" name="payment" value="crypto" checked={paymentMethod === 'crypto'} readOnly />
                            <label htmlFor="crypto">Crypto (Binance)</label>
                        </div>
                    </div>
                    
                    {paymentMethod === 'bank' && (
                        <div className={styles.paymentDetails}>
                            <h4>Bank Account Details</h4>
                            <p>Please transfer the total amount to the following account and upload the receipt.</p>
                            <ul>
                                <li><strong>Bank:</strong> Commercial Bank</li>
                                <li><strong>Account Name:</strong> RapidGo (Pvt) Ltd</li>
                                <li><strong>Account No:</strong> 1000 1234 5678</li>
                            </ul>
                        </div>
                    )}

                    {paymentMethod === 'crypto' && (
                        <div className={styles.paymentDetails}>
                            <h4>Binance Pay Details</h4>
                            <p>Please send the equivalent crypto amount to the following Binance Pay ID and upload a screenshot.</p>
                             <ul><li><strong>Binance Pay ID:</strong> rapidgo_pay</li></ul>
                        </div>
                    )}

                    <div className={styles.uploadSection}>
                        <label htmlFor="paymentProof" className={styles.uploadLabel}>
                            <FiUpload />
                            <span>{paymentProof ? paymentProof.name : 'Upload Payment Proof'}</span>
                        </label>
                        <input type="file" id="paymentProof" onChange={handleFileChange} accept="image/png, image/jpeg" style={{display: 'none'}} />
                    </div>
                </div>

                <div className={styles.orderSummary}>
                    <h2>Your Order</h2>
                    {cartItems.map(item => (
                        <div key={item._id} className={styles.summaryItem}>
                            <div className={styles.summaryImgWrapper}>
                                <img src={getImageUrl(item)} alt={item.name} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px'}} />
                            </div>
                            <span className={styles.summaryItemName}>{item.name} x {item.quantity}</span>
                            <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className={`${styles.summaryLine} ${styles.total}`}>
                        <span>Total</span>
                        <span>Rs. {total.toFixed(2)}</span>
                    </div>
                    <button onClick={handlePlaceOrder} className={styles.placeOrderBtn} disabled={cartItems.length === 0 || !paymentProof || isPlacingOrder}>
                        {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;