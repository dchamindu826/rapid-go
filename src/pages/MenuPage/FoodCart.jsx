import React, { useState } from 'react';
import { useFoodCart } from '../../contexts/FoodCartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckoutModal from './CheckoutModal';
import styles from './MenuPage.module.css';
import { ShoppingCart, Trash2 } from 'lucide-react';

export default function FoodCart({ item, showSummary, restaurant }) {
    const { cartItems, addToCart, updateQuantity, removeFromCart, cartTotal } = useFoodCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showCheckout, setShowCheckout] = useState(false);

    const handleCheckoutClick = () => {
        if (!currentUser) {
            alert("Please sign in to continue.");
            navigate('/login', { state: { from: location } });
        } else {
            setShowCheckout(true);
        }
    };
    
    // This is for the "Add" button on each item card
    if (!showSummary) {
        return <button className={styles.addButton} onClick={() => addToCart(item)}>Add</button>;
    }
    
    // This is for the Cart Sidebar
    return (
        <>
            {showCheckout && <CheckoutModal restaurant={restaurant} onClose={() => setShowCheckout(false)} />}
            <h3><ShoppingCart size={20}/> Your Order</h3>
            {cartItems.length > 0 ? (
                <>
                    <div className={styles.cartItemsList}>
                        {cartItems.map(cartItem => (
                            <div key={cartItem._id} className={styles.cartItem}>
                                <div className={styles.cartItemInfo}>
                                    <span>{cartItem.name}</span>
                                    <span>Rs. {(cartItem.price * cartItem.quantity).toFixed(2)}</span>
                                </div>
                                <div className={styles.quantityControl}>
                                    <button onClick={() => updateQuantity(cartItem._id, cartItem.quantity - 1)}>-</button>
                                    <span>{cartItem.quantity}</span>
                                    <button onClick={() => updateQuantity(cartItem._id, cartItem.quantity + 1)}>+</button>
                                    <button className={styles.removeBtn} onClick={() => removeFromCart(cartItem._id)}><Trash2 size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.cartTotal}><strong>Subtotal:</strong><strong>Rs. {cartTotal.toFixed(2)}</strong></div>
                    <button className={styles.checkoutBtn} onClick={handleCheckoutClick}>Proceed to Checkout</button>
                </>
            ) : (
                <p className={styles.emptyCartMessage}>Your cart is empty.</p>
            )}
        </>
    );
}