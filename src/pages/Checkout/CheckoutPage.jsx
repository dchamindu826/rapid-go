import React from 'react';
import styles from './CheckoutPage.module.css';
import { useCart } from '../contexts/CartContext';

const CheckoutPage = () => {
    const { cartItems } = useCart();
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 250.00;
    const total = subtotal + deliveryFee;

    return (
        <div className={`${styles.checkoutPage} container`}>
            <h1>Checkout</h1>
            <div className={styles.checkoutLayout}>
                <div className={styles.shippingDetails}>
                    <h2>Shipping Address</h2>
                    <form className={styles.shippingForm}>
                        <input type="text" placeholder="Full Name" />
                        <input type="text" placeholder="Address Line 1" />
                        <input type="text" placeholder="City" />
                        <input type="text" placeholder="Phone Number" />
                    </form>
                    <h2>Payment Method</h2>
                    <div className={styles.paymentOptions}>
                        <div className={styles.option}>
                            <input type="radio" id="card" name="payment" value="card" defaultChecked />
                            <label htmlFor="card">Credit/Debit Card</label>
                        </div>
                        <div className={styles.option}>
                            <input type="radio" id="cod" name="payment" value="cod" />
                            <label htmlFor="cod">Cash on Delivery</label>
                        </div>
                    </div>
                </div>
                <div className={styles.orderSummary}>
                    <h2>Your Order</h2>
                    {cartItems.map(item => (
                        <div key={item.id} className={styles.summaryItem}>
                            <span>{item.name} x {item.quantity}</span>
                            <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className={styles.summaryLine}>
                        <span>Subtotal</span>
                        <span>Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className={styles.summaryLine}>
                        <span>Delivery Fee</span>
                        <span>Rs. {deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className={`${styles.summaryLine} ${styles.total}`}>
                        <span>Total</span>
                        <span>Rs. {total.toFixed(2)}</span>
                    </div>
                    <button className={styles.placeOrderBtn}>Place Order</button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;