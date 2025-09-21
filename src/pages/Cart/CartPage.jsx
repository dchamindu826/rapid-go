import React from 'react';
import styles from './CartPage.module.css';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { FiTrash2 } from 'react-icons/fi';
// ProductImage component eka wenwuata, api urlFor direct use karamu lesi nisa.
// E nisa oyage ProductImage component eka onenam ain karanna puluwan.
import { urlFor } from '../../sanityClient';

const CartPage = () => {
    const { cartItems, updateQuantity, removeFromCart } = useCart();

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal;

    // Function to get image URL from an item
    const getImageUrl = (item) => {
        // Aluth 'images' array eken palaweni image eka ganna
        const image = item.images?.[0];
        if (image?.asset?._ref) {
            return urlFor(image).width(160).url();
        }
        // Image ekak nathnam, default placeholder ekak pennanna
        return 'https://placehold.co/160x160/1E293B/E2E8F0?text=No+Image';
    };

    if (cartItems.length === 0) {
        return (
            <div className={`${styles.cartPage} ${styles.emptyCart} page-wrapper container`}>
                <h1>Your Cart is Empty</h1>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <Link to="/shop" className={styles.shopLink}>Continue Shopping</Link>
            </div>
        )
    }

    return (
        <div className={`${styles.cartPage} page-wrapper container`}>
            <h1>Your Shopping Cart</h1>
            <div className={styles.cartLayout}>
                <div className={styles.cartItems}>
                    {cartItems.map(item => (
                        <div key={item._id || item.name} className={styles.cartItem}>
                            <div className={styles.cartImageWrapper}>
                                <img src={getImageUrl(item)} alt={item.name} className={styles.cartItemImage} />
                            </div>
                            <div className={styles.itemDetails}>
                                <h3>{item.name}</h3>
                                <p>Price: Rs. {item.price.toFixed(2)}</p>
                                <div className={styles.quantityControl}>
                                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                                    <input type="number" value={item.quantity} readOnly />
                                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                                </div>
                            </div>
                            <p className={styles.itemTotal}>Rs. {(item.price * item.quantity).toFixed(2)}</p>
                            <button className={styles.removeBtn} onClick={() => removeFromCart(item._id)}><FiTrash2 /></button>
                        </div>
                    ))}
                </div>
                
                <div className={styles.orderSummary}>
                    <h2>Order Summary</h2>
                    <div className={styles.summaryLine}>
                        <span>Subtotal</span>
                        <span>Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className={`${styles.summaryLine} ${styles.total}`}>
                        <span>Total</span>
                        <span>Rs. {total.toFixed(2)}</span>
                    </div>
                    <Link to="/checkout" className={styles.checkoutBtn}>Proceed to Checkout</Link>
                </div>
            </div>
        </div>
    );
};

export default CartPage;