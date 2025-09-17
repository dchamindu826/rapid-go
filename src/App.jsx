import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import FloatingButtons from './components/FloatingButtons/FloatingButtons';
import ProtectedRoute from './components/ProtectedRoute';

// Page Imports
import HomePage from './pages/Home/HomePage';
import ShopPage from './pages/ShopPage'; // <-- This is the corrected path
import TrackingPage from './pages/Tracking/TrackingPage';
import AboutPage from './pages/About/AboutPage';
import ContactPage from './pages/Contact/ContactPage';
import LoginPage from './pages/Login/LoginPage';
import SignUpPage from './pages/SignUp/SignUpPage';
import CartPage from './pages/Cart/CartPage';
import ProfilePage from './pages/Profile/ProfilePage';
import ProductDetailPage from './pages/ProductDetail/ProductDetailPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import ThankYouPage from './pages/ThankYou/ThankYouPage';

function App() {
  return (
    <>
      <div className="container">
        <Header />
      </div>
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/thank-you" element={<ThankYouPage />} />
      </Routes>
      
      <Footer />
      <FloatingButtons />
    </>
  );
}

export default App;