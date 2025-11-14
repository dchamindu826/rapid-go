import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { client } from '../../sanityClient';
import { useFoodCart } from '../../contexts/FoodCartContext';
import { useAuth } from '../../contexts/AuthContext';
import styles from './MenuPage.module.css';
import { X, MapPin, CreditCard, CheckCircle, LocateFixed } from 'lucide-react';
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

// --- DISTANCE & FEE LOGIC ---
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const PER_KM_RATE = 40; 

const calculateHandlingFee = (distance) => {
  if (distance <= 0) return 0;
  if (distance <= 4) return 60; 
  if (distance <= 10) return 80; 
  return 80; 
};


export default function CheckoutModal({ restaurant, onClose }) {
  const { cartItems, cartTotal, clearCart } = useFoodCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: currentUser?.displayName || '', phone: '', notes: '' });
  const [userLocation, setUserLocation] = useState(null); 
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  const [isMapVisible, setIsMapVisible] = useState(false); 
  const [mapPosition, setMapPosition] = useState({ lat: 6.9271, lng: 79.8612 }); 

  const [handlingFee, setHandlingFee] = useState(0);
  const [perKmCharge, setPerKmCharge] = useState(0);
  
  // (!!!) --- ALUTH STATE EKA (KM ගාන පෙන්නන්න) ---
  const [distance, setDistance] = useState(0);
  // --------------------------------------------------

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
      
      const newHandlingFee = calculateHandlingFee(dist);
      const newPerKmCharge = dist * PER_KM_RATE;

      setHandlingFee(newHandlingFee);
      setPerKmCharge(newPerKmCharge);
      
      // (!!!) --- KM ගාන STATE EKE SAVE KARANAWA ---
      setDistance(dist);
      // ---------------------------------------------
    }
  };

  // --- MAP FUNCTIONS ---
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

  const handleConfirmMapLocation = () => {
    handleLocationSelect(mapPosition); 
    setIsMapVisible(false); 
  };
  // --------------------------------

  const handlePlaceOrder = async (e) => {
    // ... (handlePlaceOrder function eke wenasak na)
    e.preventDefault();
    if (!userLocation) {
      Swal.fire('Location Needed', 'Please provide your delivery location.', 'warning');
      return;
    }
    setIsPlacingOrder(true);
    
    const totalDeliveryCost = handlingFee + perKmCharge;
    const totalGrandTotal = cartTotal + totalDeliveryCost;

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
        deliveryCharge: totalDeliveryCost, 
        grandTotal: totalGrandTotal,
        orderStatus: 'pending',
        createdAt: new Date().toISOString(),
        statusUpdates: [{ _key: Math.random().toString(), status: 'pending', timestamp: new Date().toISOString() }],
        orderedItems: cartItems.map(item => ({
          _key: `${item._id}-${Math.random()}`,
          item: { _type: 'reference', _ref: item._id },
          quantity: item.quantity,
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
  
  const grandTotal = cartTotal + handlingFee + perKmCharge;

  return ReactDOM.createPortal(
    <>
      <div className={styles.modalBackdrop} onClick={onClose}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>Confirm Your Order</h2>
            <button className={styles.closeModalBtn} onClick={onClose}><X size={24}/></button>
          </div>

          <form onSubmit={handlePlaceOrder} className={styles.checkoutForm}>
            
            {!isMapVisible && (
              <>
                <input type="text" placeholder="Receiver Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="tel" placeholder="Contact Number" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <textarea placeholder="Special notes for the restaurant or rider" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </>
            )}
            
            <div className={styles.locationBox}>
              {/* ... (Location box eke code eka wenas wenne na) ... */}
              {isMapVisible ? (
                <div className={styles.mapEmbedContainer}>
                  <MapContainer
                    center={mapPosition}
                    zoom={13}
                    style={{ height: '300px', width: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <SearchField onLocationSelect={setMapPosition} />
                    <MapClickHandler setPosition={setMapPosition} />
                    <Marker position={mapPosition} />
                    <MapEvents position={mapPosition} />
                  </MapContainer>
                  <button type="button" className={styles.mapFindMeBtn} onClick={handleFindMe}>
                    <LocateFixed size={18} />
                  </button>
                  <button type="button" className={styles.mapConfirmBtn} onClick={handleConfirmMapLocation}>
                    Confirm Location & Continue
                  </button>
                </div>
              ) : userLocation ? (
                <div className={styles.locationSet}>
                  <CheckCircle size={20} color="#22C55E" />
                  <div>
                    <p>Delivery location is set.</p>
                    <span>(Lat: {userLocation.latitude.toFixed(4)}, Lng: {userLocation.longitude.toFixed(4)})</span>
                  </div>
                  <button type="button" onClick={() => setIsMapVisible(true)} className={styles.changeLocationBtn}>Change</button>
                </div>
              ) : (
                <button type="button" onClick={() => setIsMapVisible(true)} className={styles.locationBtnFull}>
                  <MapPin size={16}/> Set Delivery Location
                </button>
              )}
            </div>
            
            {!isMapVisible && (
              <>
                <div className={styles.paymentMethod}>
                  <CreditCard size={16} />
                  <span>Payment Method: <strong>Cash on Delivery (COD)</strong></span>
                </div>
                
                {/* --- (!!!) ALUTH SUMMARY EKA (DISTANCE EKA SAMAGA) --- */}
                <div className={styles.summary}>
                  <div className={styles.summaryLine}><span>Subtotal</span><span>Rs. {cartTotal.toFixed(2)}</span></div>
                  <div className={`${styles.summaryLine} ${styles.faded}`}>
                    <span>Distance</span>
                    <span>{distance.toFixed(2)} km</span>
                  </div>
                  <div className={styles.summaryLine}><span>Handling Fee</span><span>Rs. {handlingFee.toFixed(2)}</span></div>
                  <div className={styles.summaryLine}><span>Delivery (Per KM)</span><span>Rs. {perKmCharge.toFixed(2)}</span></div>
                  <div className={`${styles.summaryLine} ${styles.total}`}>
                    <span>TOTAL</span>
                    <span>Rs. {grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                {/* --------------------------------------------------------- */}

                <button type="submit" className={styles.placeOrderBtn} disabled={isPlacingOrder || !userLocation}>
                  {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                </button>
              </>
            )}
            
          </form>
        </div>
      </div>
    </>,
    document.getElementById('modal-root')
  );
}