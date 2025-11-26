import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { client } from '../../sanityClient';
import { useFoodCart } from '../../contexts/FoodCartContext';
import { useAuth } from '../../contexts/AuthContext';
import styles from './CheckoutModal.module.css';
import { X, MapPin, CreditCard, CheckCircle, LocateFixed, Trash2, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// --- MAP IMPORTS ---
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

// --- VITE ICON FIX ---
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// --- MAP HELPER COMPONENTS ---
const SearchField = ({ onLocationSelect }) => {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      showMarker: false,
      autoClose: true,
      keepResult: true,
    });
    map.addControl(searchControl);
    map.on('geosearch/showlocation', (result) => {
      onLocationSelect({ lat: result.location.y, lng: result.location.x });
    });
    return () => map.removeControl(searchControl);
  }, [map, onLocationSelect]);
  return null;
};

const MapClickHandler = ({ setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return null;
};

const MapEvents = ({ position }) => {
    const map = useMap();
    useEffect(() => {
      if (map) {
        map.flyTo(position, 15);
      }
    }, [position, map]);
    return null;
  }

// --- DISTANCE CALCULATION (Haversine Formula) ---
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

// --- (!!!) NEW DELIVERY CHARGE LOGIC (Based on Table) ---
const calculateDeliveryFee = (distance) => {
  if (distance <= 0) return 0;
  if (distance <= 2) return 150;
  if (distance <= 4) return 200;
  if (distance <= 6) return 250;
  if (distance <= 8) return 300;
  if (distance <= 10) return 350;
  if (distance <= 12) return 400;
  
  // Above 12km: Rs. 50 per KM
  return distance * 50; 
};

export default function CheckoutModal({ restaurant, onClose }) {
  const { cartItems, cartTotal, clearCart, removeFromCart } = useFoodCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState('cart'); 
  const [formData, setFormData] = useState({ name: currentUser?.displayName || '', phone: '', notes: '' });
  const [userLocation, setUserLocation] = useState(null); 
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [mapPosition, setMapPosition] = useState({ lat: 6.9271, lng: 79.8612 }); 

  // Combined Delivery Charge
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleLocationSelect = (latlng) => {
    const { lat, lng } = latlng;
    setUserLocation({ latitude: lat, longitude: lng });

    if (restaurant.location?.lat && restaurant.location?.lng) {
      const dist = getDistance(restaurant.location.lat, restaurant.location.lng, lat, lng);
      
      // (!!!) Calculate using new function
      const fee = calculateDeliveryFee(dist);

      setDeliveryCharge(fee);
      setDistance(dist);
    }
    setCurrentStep('checkout');
  };

  const handleFindMe = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapPosition({ lat: latitude, lng: longitude });
      },
      () => {
        Swal.fire('Location Error', 'Could not get your location.', 'error');
      }
    );
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!userLocation) {
      Swal.fire('Location Needed', 'Please set your delivery location.', 'warning');
      return;
    }
    setIsPlacingOrder(true);
    
    const totalGrandTotal = cartTotal + deliveryCharge;

    try {
      const newOrder = {
        _type: 'foodOrder',
        receiverName: formData.name,
        receiverContact: formData.phone,
        customerEmail: currentUser.email,
        customerLocation: {
          _type: 'geopoint',
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        },
        notes: formData.notes,
        restaurant: { _type: 'reference', _ref: restaurant._id },
        foodTotal: cartTotal,
        
        // Save Delivery Charge
        deliveryCharge: deliveryCharge,
        grandTotal: totalGrandTotal,
        
        orderStatus: 'pending',
        createdAt: new Date().toISOString(),
        statusUpdates: [{ _key: Math.random().toString(), status: 'pending', timestamp: new Date().toISOString() }],
        orderedItems: cartItems.map(item => ({
          _key: `${item._id}-${Math.random()}`,
          item: { _type: 'reference', _ref: item._id.split('-')[0] },
          quantity: item.quantity,
          name: item.name 
        })),
      };

      const createdOrder = await client.create(newOrder); 
      
      Swal.fire({ icon: 'success', title: 'Order Placed!', timer: 2000, showConfirmButton: false });
      clearCart();
      navigate(`/order-status/${createdOrder._id}`);

    } catch (error) {
      console.error(error);
      Swal.fire('Order Failed', 'There was an issue placing your order.', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };
  
  const grandTotal = cartTotal + deliveryCharge;

  // --- UI PARTS ---

  const renderCartView = () => (
    <div className={styles.cartViewContainer}>
      <div className={styles.cartList}>
        {cartItems.length === 0 ? (
           <p className={styles.emptyMsg}>Your cart is empty.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item._id} className={styles.cartItemRow}>
               <div className={styles.cartItemDetails}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemPrice}>
                    {item.quantity} x Rs.{item.price}
                  </span>
               </div>
               <button className={styles.deleteBtn} onClick={() => removeFromCart(item._id)}>
                  <Trash2 size={18} />
               </button>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <>
            <div className={styles.cartTotalRow}>
                <span>Subtotal</span>
                <strong>Rs. {cartTotal.toFixed(2)}</strong>
            </div>
            <div className={styles.cartActions}>
                <button className={styles.clearCartBtn} onClick={clearCart}>
                    Clear
                </button>
                <button className={styles.checkoutBtn} onClick={() => setCurrentStep('checkout')}>
                    Proceed
                </button>
            </div>
        </>
      )}
    </div>
  );

  const renderCheckoutForm = () => (
    <form onSubmit={handlePlaceOrder} className={styles.checkoutForm}>
        <div className={styles.backLink} onClick={() => setCurrentStep('cart')}>
            <ArrowLeft size={16}/> Back to Cart
        </div>

        <input type="text" placeholder="Receiver Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        <input type="tel" placeholder="Contact Number" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
        <textarea placeholder="Special notes (e.g., Gate code)" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
        
        <div className={styles.locationBox}>
            {userLocation ? (
            <div className={styles.locationSet}>
                <CheckCircle size={20} color="#34D399" />
                <div>
                <p>Delivery location set</p>
                <span>{userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</span>
                </div>
                <button type="button" onClick={() => setCurrentStep('map')} className={styles.changeLocationBtn}>Change</button>
            </div>
            ) : (
            <button type="button" onClick={() => setCurrentStep('map')} className={styles.locationBtnFull}>
                <MapPin size={18}/> Set Delivery Location
            </button>
            )}
        </div>

        <div className={styles.paymentMethod}>
            <CreditCard size={18} />
            <span>Method: <strong>Cash on Delivery (COD)</strong></span>
        </div>
        
        <div className={styles.summary}>
            <div className={styles.summaryLine}><span>Subtotal</span><span>Rs. {cartTotal.toFixed(2)}</span></div>
            <div className={styles.summaryLine}>
                <span>Delivery Charge ({distance.toFixed(1)}km)</span>
                <span>Rs. {deliveryCharge.toFixed(2)}</span>
            </div>
            <div className={`${styles.summaryLine} ${styles.total}`}>
            <span>TOTAL</span>
            <span>Rs. {grandTotal.toFixed(2)}</span>
            </div>
        </div>

        <button type="submit" className={styles.placeOrderBtn} disabled={isPlacingOrder || !userLocation}>
            {isPlacingOrder ? 'Placing Order...' : 'Confirm Order'}
        </button>
    </form>
  );

  const renderMap = () => (
    <div className={styles.mapEmbedContainer}>
        <div className={styles.backLink} onClick={() => setCurrentStep('checkout')} style={{marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#FACC15'}}>
            <ArrowLeft size={16}/> Back to Form
        </div>
        <div className={styles.mapWrapper}>
            <MapContainer center={mapPosition} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <SearchField onLocationSelect={setMapPosition} />
                <MapClickHandler setPosition={setMapPosition} />
                <Marker position={mapPosition} />
                <MapEvents position={mapPosition} />
            </MapContainer>
            
            <button type="button" className={styles.mapFindMeBtn} onClick={handleFindMe}>
                <LocateFixed size={20} />
            </button>
            <button type="button" className={styles.mapConfirmBtn} onClick={() => handleLocationSelect(mapPosition)}>
                Confirm Location
            </button>
        </div>
    </div>
  );

  let title = "Your Cart";
  if (currentStep === 'checkout') title = "Checkout";
  if (currentStep === 'map') title = "Set Location";

  return ReactDOM.createPortal(
    <>
      <div className={styles.modalBackdrop} onClick={onClose}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>{title}</h2>
            <button className={styles.closeModalBtn} onClick={onClose}><X size={20}/></button>
          </div>

          <div className={styles.modalBody}>
             {currentStep === 'cart' && renderCartView()}
             {currentStep === 'checkout' && renderCheckoutForm()}
             {currentStep === 'map' && renderMap()}
          </div>

        </div>
      </div>
    </>,
    document.getElementById('modal-root')
  );
}