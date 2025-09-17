import React, { useState } from 'react';
import styles from './CheckoutPage.module.css';
import { useCart } from '../../contexts/CartContext';
import { FiUpload } from 'react-icons/fi';

const CheckoutPage = () => {
    const { cartItems } = useCart();
    const [paymentMethod, setPaymentMethod] = useState('bank'); // 'bank' or 'crypto'
    const [paymentProof, setPaymentProof] = useState(null);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal;

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setPaymentProof(e.target.files[0]);
        }
    };

    return (
        <div className={`${styles.checkoutPage} container`}>
            <h1>Checkout</h1>
            <div className={styles.checkoutLayout}>
                <div className={styles.customerDetails}>
                    <h2>Billing Details</h2>
                    <form className={styles.billingForm}>
                        <input type="text" placeholder="Full Name" required/>
                        <input type="email" placeholder="Email Address" required/>
                    </form>

                    <h2>Payment Method</h2>
                    <div className={styles.paymentOptions}>
                        <div className={styles.option}>
                            <input type="radio" id="bank" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} />
                            <label htmlFor="bank">Bank Transfer</label>
                        </div>
                        <div className={styles.option}>
                            <input type="radio" id="crypto" name="payment" value="crypto" checked={paymentMethod === 'crypto'} onChange={() => setPaymentMethod('crypto')} />
                            <label htmlFor="crypto">Crypto (Binance)</label>
                        </div>
                    </div>
                    
                    {/* --- Bank Transfer Details --- */}
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

                    {/* --- Crypto Payment Details --- */}
                    {paymentMethod === 'crypto' && (
                        <div className={styles.paymentDetails}>
                            <h4>Binance Pay Details</h4>
                            <p>Please send the equivalent crypto amount to the following Binance Pay ID and upload a screenshot of the transaction.</p>
                             <ul>
                                <li><strong>Binance Pay ID:</strong> rapidgo_pay</li>
                            </ul>
                        </div>
                    )}

                    {/* --- File Upload --- */}
                    <div className={styles.uploadSection}>
                        <label htmlFor="paymentProof" className={styles.uploadLabel}>
                            <FiUpload />
                            <span>Upload Payment Proof</span>
                        </label>
                        <input type="file" id="paymentProof" onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" />
                        {paymentProof && <p className={styles.fileName}>Selected file: {paymentProof.name}</p>}
                    </div>
                </div>

                <div className={styles.orderSummary}>
                    {/* ... Order Summary eka kalin widiyatama thiyenawa ... */}
                    <h2>Your Order</h2>
                    {cartItems.length > 0 ? (
                        cartItems.map(item => (
                            <div key={item.id} className={styles.summaryItem}>
                                <span>{item.name} x {item.quantity}</span>
                                <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))
                    ) : ( <p>Your cart is empty.</p> )}
                    <div className={`${styles.summaryLine} ${styles.total}`}>
                        <span>Total</span>
                        <span>Rs. {total.toFixed(2)}</span>
                    </div>
                    <button className={styles.placeOrderBtn} disabled={cartItems.length === 0 || !paymentProof}>
                        Place Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;