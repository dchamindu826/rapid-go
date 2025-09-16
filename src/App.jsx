import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header'; // Path eka wenas kara
import Footer from './components/Footer/Footer'; // Path eka wenas kara

import HomePage from './pages/Home/HomePage';
import ShopPage from './pages/Shop/ShopPage';
import TrackingPage from './pages/Tracking/TrackingPage';
import AboutPage from './pages/About/AboutPage';
import ContactPage from './pages/Contact/ContactPage';
import LoginPage from './pages/Login/LoginPage';
import CartPage from './pages/Cart/CartPage';
import ProfilePage from './pages/Profile/ProfilePage';
import ProductDetailPage from './pages/ProductDetail/ProductDetailPage';


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
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      
      <Footer />
    </>
  );
}

export default App;