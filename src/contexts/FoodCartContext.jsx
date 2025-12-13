import React, { useState, createContext, useContext, useEffect } from 'react';
import Swal from 'sweetalert2';

const FoodCartContext = createContext();

export const useFoodCart = () => useContext(FoodCartContext);

export const FoodCartProvider = ({ children }) => {
    // 1. Cart Items - LocalStorage වලින් ගන්නවා refresh වුනත් තියෙන්න
    const [cartItems, setCartItems] = useState(() => {
        const savedItems = localStorage.getItem('foodCart');
        return savedItems ? JSON.parse(savedItems) : [];
    });

    // 2. Cart Restaurant ID - දැනට cart එකේ තියෙන items අයිති කාටද කියල මතක තියාගන්නවා
    const [cartRestaurantId, setCartRestaurantId] = useState(() => {
        return localStorage.getItem('cartRestaurantId') || null;
    });

    // Data වෙනස් වෙන හැම වෙලාවෙම LocalStorage update කරන්න
    useEffect(() => {
        localStorage.setItem('foodCart', JSON.stringify(cartItems));
        if (cartRestaurantId) {
            localStorage.setItem('cartRestaurantId', cartRestaurantId);
        } else {
            localStorage.removeItem('cartRestaurantId');
        }
    }, [cartItems, cartRestaurantId]);

    // --- ADD TO CART (Logic Updated) ---
    const addToCart = (item, restaurantId) => {
        // A. Cart එකේ බඩු තියෙනවා නම් සහ ඒ Restaurant එක දැන් දාන එකට වඩා වෙනස් නම්
        if (cartItems.length > 0 && cartRestaurantId && cartRestaurantId !== restaurantId) {
            Swal.fire({
                title: 'Start a new basket?',
                text: "Your cart contains items from another restaurant. Do you want to clear it and add this item?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#FACC15',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, clear it!',
                color: '#000',
                background: '#fff'
            }).then((result) => {
                if (result.isConfirmed) {
                    // පරණ Cart එක clear කරලා අලුත් item එක දානවා
                    setCartItems([{ ...item, quantity: 1 }]);
                    setCartRestaurantId(restaurantId);
                    Swal.fire({
                        title: 'Cart Updated!',
                        text: 'Previous items cleared. New item added.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            });
            return; // එතනින් නවතිනවා
        }

        // B. Restaurant එක සමාන නම් හෝ Cart එක හිස් නම් සාමාන්‍ය විදිහට add වෙනවා
        setCartRestaurantId(restaurantId);

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
        const updatedCart = cartItems.filter(i => i._id !== itemId);
        setCartItems(updatedCart);
        
        // Cart එක සම්පූර්ණයෙන්ම හිස් වුනොත් Restaurant ID එකත් අයින් කරන්න
        if (updatedCart.length === 0) {
            setCartRestaurantId(null);
        }
    };

    const clearCart = () => {
        setCartItems([]);
        setCartRestaurantId(null);
        localStorage.removeItem('foodCart');
        localStorage.removeItem('cartRestaurantId');
    };

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const value = { 
        cartItems, 
        addToCart, 
        updateQuantity, 
        removeFromCart, 
        clearCart, 
        cartTotal,
        cartRestaurantId 
    };

    return (
        <FoodCartContext.Provider value={value}>
            {children}
        </FoodCartContext.Provider>
    );
};