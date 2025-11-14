import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { client } from '../../sanityClient';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import styles from './OrderStatusPage.module.css';
import { Loader2, CheckCircle, Circle, ShoppingBag, ChefHat, Package, Bike } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// --- (!!!) ALUTH ICONS IMPORT KARAGATHTHA (!!!) ---
import riderIconPng from '../../assets/rider-icon.png';
import restaurantIconPng from '../../assets/restaurant-icon.png'; // <-- ALUTH ICON
import customerIconPng from '../../assets/customer-icon.png';   // <-- ALUTH ICON
// --------------------------------------------------

// --- Default Leaflet Icon Fix (maka ona naha, eth hoda purudak) ---
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon; // Default icon eka set karanawa


// (!!!) --- CUSTOM ICONS HADA GATHTHA THANA --- (!!!)
const RiderIcon = L.icon({
  iconUrl: riderIconPng,
  iconSize: [60, 60],
  iconAnchor: [30, 30],
  popupAnchor: [0, -25],
});

const RestaurantIcon = L.icon({
  iconUrl: restaurantIconPng, // oyage restaurant icon eka
  iconSize: [70, 70],        // Size adjust karanna puluwan
  iconAnchor: [35, 35],      // Icon eke "bottom" point eka map eke point ekata ganna
  popupAnchor: [0, -40],
});

const CustomerIcon = L.icon({
  iconUrl: customerIconPng,  // oyage customer icon eka
  iconSize: [70, 70],        // Size adjust karanna puluwan
  iconAnchor: [35, 35],      // Icon eke "bottom" point eka map eke point ekata ganna
  popupAnchor: [0, -40],
});
// --------------------------------------------------


const AutoZoom = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

// --- Status Config ---
const statusConfig = {
  pending: { title: 'Order Placed', icon: <ShoppingBag size={20} />, description: "We've received your order." },
  preparing: { title: 'Preparing Food', icon: <ChefHat size={20} />, description: "The restaurant is preparing your food." },
  readyForPickup: { title: 'Ready for Pickup', icon: <Package size={20} />, description: "Your order is ready to be collected." },
  assigned: { title: 'Rider Assigned', icon: <Bike size={20} />, description: "A rider is on the way to the restaurant." },
  onTheWay: { title: 'On The Way', icon: <Bike size={20} />, description: "Your rider is bringing your order." },
  completed: { title: 'Delivered', icon: <CheckCircle size={20} />, description: "Enjoy your meal!" },
  cancelled: { title: 'Cancelled', icon: <CheckCircle size={20} />, description: "This order was cancelled." },
};
const formatTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// -----------------------------------------------------------------


const OrderStatusPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [activeRiderId, setActiveRiderId] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    let orderSubscription;
    let riderSubscription;

    const startRiderListener = (riderId) => {
      if (!riderId || riderId === activeRiderId) return;
      console.log(`Starting listener for RIDER: ${riderId}`);
      setActiveRiderId(riderId); 

      if (riderSubscription) riderSubscription.unsubscribe();

      riderSubscription = client.listen(
        `*[_type == "rider" && _id == $riderId]`,
        { riderId }
      ).subscribe(update => {
          const updatedLocation = update.result?.currentLocation;
          if (updatedLocation) {
            console.log('Rider location updated!', updatedLocation);
            setRiderLocation(updatedLocation);
          }
      });
    };

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderQuery = `*[_type == "foodOrder" && _id == $orderId][0] {
          ...,
          "statusHistory": statusUpdates, 
          restaurant->{ name, location },
          assignedRider->{ _id, fullName, currentLocation } 
        }`;
        
        const data = await client.fetch(orderQuery, { orderId });
        
        if (!data) {
          setError('Order not found.'); setLoading(false); return;
        }
        
        setOrder(data); 

        if (data.createdAt) {
          let estimatedArrivalTime = new Date(data.createdAt);
          const prepTime = data.preparationTime || 15;
          estimatedArrivalTime.setMinutes(estimatedArrivalTime.getMinutes() + prepTime);
          setEstimatedTime(formatTime(estimatedArrivalTime.toISOString()));
        }

        if (data.assignedRider?.currentLocation) {
          setRiderLocation(data.assignedRider.currentLocation);
        }

        // --- LISTENER 1: ORDER STATUS (BUG FIX) ---
        orderSubscription = client.listen(
          `*[_type == "foodOrder" && _id == $orderId]`, 
          { orderId } 
        ).subscribe(update => {
            const newStatus = update.result?.orderStatus;
            const newHistory = update.result?.statusUpdates;
            const newRiderRef = update.result?.assignedRider;

            if (newStatus) {
                console.log("Order update received:", newStatus);
                setOrder(prevOrder => ({
                  ...prevOrder,
                  orderStatus: newStatus,
                  statusHistory: newHistory,
                  assignedRider: newRiderRef ? newRiderRef : prevOrder.assignedRider
                }));
            
                const newRiderId = newRiderRef?._id;
                if (newRiderId) {
                  startRiderListener(newRiderId);
                }
            }
        });
        // ---------------------------------------------

        // --- LISTENER 2: RIDER (INITIAL LOAD) ---
        const initialRiderId = data.assignedRider?._id;
        startRiderListener(initialRiderId); 
        
        setLoading(false);

      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load order status.'); setLoading(false);
      }
    };

    fetchOrder();

    return () => {
      if (orderSubscription) orderSubscription.unsubscribe();
      if (riderSubscription) riderSubscription.unsubscribe();
    };
  }, [orderId]);

  if (loading) return <div className="page-wrapper container"><h2>Loading Order Status...</h2></div>;
  if (error) return <div className="page-wrapper container"><h2>{error}</h2></div>;
  if (!order) return <div className="page-wrapper container"><h2>Order not found.</h2></div>;

  // --- Map eke pennanna Points 3 ---
  const restaurantPos = order.restaurant?.location ? [order.restaurant.location.lat, order.restaurant.location.lng] : null;
  const customerPos = order.customerLocation ? [order.customerLocation.lat, order.customerLocation.lng] : null;
  const riderPos = riderLocation ? [riderLocation.lat, riderLocation.lng] : null;
  
  const isOrderActive = order.orderStatus === 'assigned' || order.orderStatus === 'onTheWay';
  
  const showLiveMap = isOrderActive && !!riderPos && !!customerPos && !!restaurantPos;

  // Debug Table
  console.table({
    STATUS_IS_ACTIVE: isOrderActive,
    HAS_RIDER_POS: !!riderPos,
    HAS_CUSTOMER_POS: !!customerPos,
    HAS_RESTAURANT_POS: !!restaurantPos,
    RESULT_SHOW_MAP: showLiveMap
  });

  const bounds = [];
  if (restaurantPos) bounds.push(restaurantPos);
  if (customerPos) bounds.push(customerPos);
  if (riderPos) bounds.push(riderPos);

  const currentStatusIndex = Object.keys(statusConfig).findIndex(s => s === order.orderStatus);

  return (
    <div className={`page-wrapper container ${styles.statusPage}`}>
      
      <div className={styles.statusHeader}>
        <h1>Order #{order._id.slice(-6)}</h1>
        <p>Estimated Arrival: <strong>{estimatedTime || "Calculating..."}</strong></p>
      </div>

      <div className={styles.timelineContainer}>
        {Object.keys(statusConfig).map((statusKey, index) => {
          if (statusKey === 'cancelled') return null; 
          const statusInfo = statusConfig[statusKey];
          const statusUpdate = order.statusHistory?.find(s => s.status === statusKey);
          let itemClass = styles.timelineItem;
          let icon = <Circle size={20} />;
          if (index < currentStatusIndex || order.orderStatus === 'completed') {
            itemClass = `${styles.timelineItem} ${styles.done}`;
            icon = <CheckCircle size={20} />;
          } else if (index === currentStatusIndex) {
            itemClass = `${styles.timelineItem} ${styles.active}`;
            icon = <Loader2 size={20} className={styles.spinningIcon} />;
          } else {
            itemClass = `${styles.timelineItem} ${styles.pending}`;
            icon = statusInfo.icon;
          }
          return (
            <div className={itemClass} key={statusKey}>
              <div className={styles.timelineIcon}>{icon}</div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <h4>{statusInfo.title}</h4>
                  <span className={styles.timestamp}>
                    {statusUpdate ? formatTime(statusUpdate.timestamp) : ''}
                  </span>
                </div>
                <p>{statusInfo.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.mapContainer}>
        {showLiveMap ? (
          <MapContainer center={customerPos} zoom={13} style={{ height: '100%', width: '100%' }}>
            
            {/* Light Mode Map Style */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {/* (!!!) --- CUSTOM ICONS USE KALA THANA --- (!!!) */}
            <Marker position={restaurantPos} icon={RestaurantIcon}><Popup>Restaurant</Popup></Marker>
            <Marker position={customerPos} icon={CustomerIcon}><Popup>Your Location</Popup></Marker>
            <Marker position={riderPos} icon={RiderIcon}><Popup>Your Rider</Popup></Marker>
            {/* -------------------------------------------------- */}

            <AutoZoom bounds={bounds} />
          </MapContainer>
        ) : (
          <div className={styles.mapPlaceholder}>
            <p>
              {order.orderStatus === 'completed' || order.orderStatus === 'cancelled'
                ? "Tracking is complete for this order."
                : "Live tracking will be available once a rider is assigned and on the way."
              }
            </p> 
          </div>
        )}
      </div>

    </div>
  );
};

export default OrderStatusPage;