import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const exist = prevItems.find(item => item._id === product._id); // Use _id for Sanity
      if (exist) {
        return prevItems.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };
  
  const updateQuantity = (productId, quantity) => {
      setCartItems(prevItems => 
        prevItems.map(item => 
            item._id === productId ? {...item, quantity: Math.max(0, quantity)} : item
        ).filter(item => item.quantity > 0)
      );
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  // The new function to clear the cart after an order is placed
  const clearCart = () => {
      setCartItems([]);
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart, // Added here
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};