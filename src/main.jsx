import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // Import kara
import App from './App.jsx'
import './index.css'
import { CartProvider } from './contexts/CartContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* App eka wrap kara */}
    <CartProvider> 
      <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)