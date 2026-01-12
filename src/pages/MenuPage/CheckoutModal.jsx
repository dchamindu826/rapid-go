import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { client, urlFor } from '../../sanityClient';
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

// --- DISTANCE CALCULATION HELPER (Fallback) ---
const getStraightLineDistance = (lat1, lon1, lat2, lon2) => {
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

// --- OSRM API FOR ROAD DISTANCE ---
const getRoadDistance = async (lat1, lon1, lat2, lon2) => {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`
    );
    const data = await response.json();
    
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      return data.routes[0].distance / 1000;
    }
    return null;
  } catch (error) {
    console.error("Error fetching road distance:", error);
    return null;
  }
};

// --- (!!!) UPDATED: DELIVERY CHARGE LOGIC ---
const calculateDeliveryDetails = (distance, cartTotal) => {
  if (distance <= 0) return { courierFee: 0, handlingFee: 0 };

  let courierFee = 0;
  let handlingFee = 0;

  // 1. Distance Based Calculation
  if (distance <= 2.0) {
    // --- UPDATED LOGIC FOR 0-2 KM ---
    // Any distance between 0 and 2 km is a flat rate of 60.
    courierFee = 60; 
    handlingFee = 60;
  } else if (distance <= 4.0) {
    courierFee = distance * 40;
    handlingFee = 50;
  } else if (distance <= 7.0) {
    courierFee = distance * 40;
    handlingFee = 50; 
  } else {
    // More than 7km
    courierFee = distance * 40;
    handlingFee = 50; 
  }
  
  // 2. Extra Charges Based on Order Value
  if (cartTotal > 8000) {
    courierFee += 200; // Above 8000 -> Add 200
  } else if (cartTotal >= 5000) {
    courierFee += 100; // Between 5000 and 8000 -> Add 100
  }

  return { 
    courierFee: Math.round(courierFee), 
    handlingFee: handlingFee 
  };
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
  
  const [calculatingDistance, setCalculatingDistance] = useState(false);

  const [distance, setDistance] = useState(0);
  const [courierFee, setCourierFee] = useState(0);
  const [handlingFee, setHandlingFee] = useState(0);

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  // --- RECALCULATE ON CART CHANGE ---
  useEffect(() => {
    if (userLocation && distance > 0) {
        const { courierFee, handlingFee } = calculateDeliveryDetails(distance, cartTotal);
        setCourierFee(courierFee);
        setHandlingFee(handlingFee);
    }
  }, [cartTotal, distance, userLocation]);


  const handleLocationSelect = async (latlng) => {
    const { lat, lng } = latlng;
    setUserLocation({ latitude: lat, longitude: lng });

    if (restaurant.location?.lat && restaurant.location?.lng) {
      setCalculatingDistance(true); 

      let dist = await getRoadDistance(restaurant.location.lat, restaurant.location.lng, lat, lng);

      if (dist === null) {
        console.warn("Falling back to straight-line distance");
        dist = getStraightLineDistance(restaurant.location.lat, restaurant.location.lng, lat, lng);
      }
      
      const { courierFee, handlingFee } = calculateDeliveryDetails(dist, cartTotal);

      setDistance(dist);
      setCourierFee(courierFee);
      setHandlingFee(handlingFee);
      setCalculatingDistance(false);
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

    // --- MEKA ADD KARANNA (START) ---
    // User login wela nattam check karanawa
    if (!currentUser) {
      Swal.fire({
        title: 'Login Required',
        text: 'Order ekak place karanna oya sign in wela inna ona.',
        icon: 'warning',
        showCancelButton: true, // Cancel button ekakuth pennanawa
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sign In', // Login button eka
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          // User 'Sign In' click karoth login page ekata yanawa
          navigate('/login');
          // Modal eka close karanna onanam methana onClose() call karanna puluwan
        }
      });
      return; // Code eka methanin nawathanawa
    }
    // --- MEKA ADD KARANNA (END) ---

    if (!userLocation) {
      Swal.fire('Location Needed', 'Please set your delivery location.', 'warning');
      return;
    }
    
    setIsPlacingOrder(true);
    
    const totalDeliveryCharge = courierFee + handlingFee;
    const totalGrandTotal = cartTotal + totalDeliveryCharge;

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
        deliveryCharge: totalDeliveryCharge, 
        grandTotal: totalGrandTotal,
        orderStatus: 'pending',
        createdAt: new Date().toISOString(),
        statusUpdates: [{ _key: Math.random().toString(), status: 'pending', timestamp: new Date().toISOString() }],
        orderedItems: cartItems.map(item => ({
          _key: `${item._id}-${Math.random()}`,
          item: { _type: 'reference', _ref: item._id.split('-')[0] },
          quantity: item.quantity,
          name: item.name,
          price: item.price,
          variation: item.name.includes('(') ? item.name.substring(item.name.indexOf('(')+1, item.name.indexOf(')')) : '',
          image: item.image ? urlFor(item.image).url() : ""
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
  
  const grandTotal = cartTotal + courierFee + handlingFee;

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
        
        {/* --- SUMMARY SECTION --- */}
        <div className={styles.summary}>
            <div className={styles.summaryLine}>
                <span>Order Value</span>
                <span>Rs. {cartTotal.toFixed(2)}</span>
            </div>
            
            <div className={styles.summaryLine} style={{fontSize: '0.9em', color: '#888'}}>
                <span>Distance {calculatingDistance && '(Calculating...)'}</span>
                <span>{distance.toFixed(2)} km</span>
            </div>

            <div className={styles.summaryLine}>
                <span>Courier Charge</span>
                <span>Rs. {courierFee.toFixed(2)}</span>
            </div>

            {handlingFee > 0 && (
                <div className={styles.summaryLine}>
                    <span>Handling Fee</span>
                    <span>Rs. {handlingFee.toFixed(2)}</span>
                </div>
            )}

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