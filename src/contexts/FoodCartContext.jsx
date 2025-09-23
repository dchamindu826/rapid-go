import React, { useState, createContext, useContext } from 'react';

const FoodCartContext = createContext();

export const useFoodCart = () => useContext(FoodCartContext);

export const FoodCartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (item) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => i._id === item._id);
            if (existingItem) {
                return prevItems.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prevItems, { ...item, quantity: 1 }];
        });
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity < 1) {
            removeFromCart(itemId);
        } else {
            setCartItems(prev => prev.map(i => i._id === itemId ? { ...i, quantity } : i));
        }
    };
    
    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(i => i._id !== itemId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const value = { cartItems, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal };

    return (
        <FoodCartContext.Provider value={value}>
            {children}
        </FoodCartContext.Provider>
    );
};