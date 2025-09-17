import React, { useState } from 'react';
import styles from './CheckoutPage.module.css';
import { useCart } from '../../contexts/CartContext';
import { client, urlFor } from '../../sanityClient';
import { useNavigate } from 'react-router-dom';
import { FiUpload } from 'react-icons/fi';
import ProductImage from '../../components/ProductImage/ProductImage';

const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [paymentProof, setPaymentProof] = useState(null);
    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '', phone: '' });
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const navigate = useNavigate();

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) { setPaymentProof(e.target.files[0]); }
    };

    const handlePlaceOrder = async () => {
        if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !paymentProof) {
            alert('Please fill all details and upload the payment proof.');
            return;
        }
        setIsPlacingOrder(true);
        
        try {
            const uploadedAsset = await client.assets.upload('image', paymentProof);
            
            const newOrder = {
                _type: 'order',
                customerName: customerDetails.name,
                customerEmail: customerDetails.email,
                orderedProduct: { _type: 'reference', _ref: cartItems[0]._id },
                totalAmount: total,
                paymentStatus: 'Pending',
                paymentProof: { _type: 'image', asset: { _type: 'reference', _ref: uploadedAsset._id } }
            };
            
            await client.create(newOrder);
            
            clearCart();
            navigate('/thank-you');

        } catch (err) {
            console.error('Order placement failed:', err);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <div className={`${styles.checkoutPage} container`}>
            <h1>Checkout</h1>
            <div className={styles.checkoutLayout}>
                <div className={styles.customerDetails}>
                    <h2>Billing Details</h2>
                    <form className={styles.billingForm}>
                        <input type="text" name="name" placeholder="Full Name" required onChange={handleInputChange} />
                        <input type="email" name="email" placeholder="Email Address" required onChange={handleInputChange} />
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
                        <input type="file" id="paymentProof" onChange={handleFileChange} accept="image/png, image/jpeg" />
                    </div>
                </div>

                <div className={styles.orderSummary}>
                    <h2>Your Order</h2>
                    {cartItems.map(item => {
                        const displayImage = item.productMedia?.find(media => media._type === 'image' || media._type === 'imageUrl');
                        return (
                            <div key={item._id} className={styles.summaryItem}>
                                <div className={styles.summaryImgWrapper}>
                                    <ProductImage mediaItem={displayImage} altText={item.name} width={100} />
                                </div>
                                <span className={styles.summaryItemName}>{item.name} x {item.quantity}</span>
                                <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        )
                    })}
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