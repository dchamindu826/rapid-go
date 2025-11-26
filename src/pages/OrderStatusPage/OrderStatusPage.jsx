import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { client } from '../../sanityClient';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import styles from './OrderStatusPage.module.css';
import { Loader2, CheckCircle, Circle, ShoppingBag, ChefHat, Package, Bike, XCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import riderIconPng from '../../assets/rider-icon.png';
import restaurantIconPng from '../../assets/restaurant-icon.png';
import customerIconPng from '../../assets/customer-icon.png';

// --- Icons Setup ---
const DefaultIcon = L.icon({
  iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow,
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const RiderIcon = L.icon({ iconUrl: riderIconPng, iconSize: [60, 60], iconAnchor: [30, 30], popupAnchor: [0, -30] });
const RestaurantIcon = L.icon({ iconUrl: restaurantIconPng, iconSize: [70, 70], iconAnchor: [35, 35], popupAnchor: [0, -40] });
const CustomerIcon = L.icon({ iconUrl: customerIconPng, iconSize: [70, 70], iconAnchor: [35, 35], popupAnchor: [0, -40] });

const AutoZoom = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) map.fitBounds(bounds, { padding: [50, 50] });
  }, [bounds, map]);
  return null;
};

const statusConfig = {
  pending: { title: 'Order Placed', icon: <ShoppingBag size={20} />, description: "We've received your order." },
  preparing: { title: 'Preparing Food', icon: <ChefHat size={20} />, description: "The restaurant is preparing your food." },
  readyForPickup: { title: 'Ready for Pickup', icon: <Package size={20} />, description: "Your order is ready to be collected." },
  assigned: { title: 'Rider Assigned', icon: <Bike size={20} />, description: "A rider is on the way to the restaurant." },
  onTheWay: { title: 'On The Way', icon: <Bike size={20} />, description: "Your rider is bringing your order." },
  completed: { title: 'Delivered', icon: <CheckCircle size={20} />, description: "Enjoy your meal!" },
  cancelled: { title: 'Order Cancelled', icon: <XCircle size={20} />, description: "This order has been cancelled." },
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

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

    // --- Function to start live rider tracking ---
    const startRiderListener = (riderId) => {
      if (!riderId || riderId === activeRiderId) return;
      console.log(`Starting tracking for Rider: ${riderId}`);
      setActiveRiderId(riderId);

      if (riderSubscription) riderSubscription.unsubscribe();

      riderSubscription = client.listen(`*[_type == "rider" && _id == $riderId]`, { riderId })
        .subscribe(update => {
          const loc = update.result?.currentLocation;
          if (loc) setRiderLocation(loc);
        });
    };

    // --- Initial Fetch ---
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // Full query with all expansions
        const query = `*[_type == "foodOrder" && _id == $orderId][0] {
          ...,
          "statusHistory": statusUpdates, 
          restaurant->{ name, location, phone },
          assignedRider->{ _id, fullName, currentLocation, phone } 
        }`;
        
        const data = await client.fetch(query, { orderId });
        
        if (!data) { setError('Order not found.'); setLoading(false); return; }
        
        setOrder(data);

        if (data.createdAt) {
          let time = new Date(data.createdAt);
          time.setMinutes(time.getMinutes() + (data.preparationTime || 30));
          setEstimatedTime(formatTime(time.toISOString()));
        }

        if (data.assignedRider?.currentLocation) {
          setRiderLocation(data.assignedRider.currentLocation);
          startRiderListener(data.assignedRider._id);
        }

        setLoading(false);

        // --- (!!!) AUTO REFRESH LISTENER (FIX) ---
        // Listen for ANY change in the order
        orderSubscription = client.listen(`*[_type == "foodOrder" && _id == $orderId]`, { orderId })
          .subscribe(async (update) => {
            console.log("Order Update Detected:", update.result?.orderStatus);
            
            // (!!!) HERE IS THE FIX: Re-fetch full data immediately
            // Listener sends raw data, we need expanded data (with rider info)
            const freshData = await client.fetch(query, { orderId });
            setOrder(freshData);

            // If rider exists now, start tracking
            if (freshData.assignedRider?._id) {
                startRiderListener(freshData.assignedRider._id);
                // Update local rider location immediately
                if (freshData.assignedRider.currentLocation) {
                    setRiderLocation(freshData.assignedRider.currentLocation);
                }
            }
          });

      } catch (err) {
        console.error(err);
        setError('Error loading order.'); setLoading(false);
      }
    };

    fetchOrder();

    return () => {
      if (orderSubscription) orderSubscription.unsubscribe();
      if (riderSubscription) riderSubscription.unsubscribe();
    };
  }, [orderId]);

  if (loading) return <div className="page-wrapper container"><h2>Loading Status...</h2></div>;
  if (!order) return <div className="page-wrapper container"><h2>Order Not Found</h2></div>;

  const restaurantPos = order.restaurant?.location ? [order.restaurant.location.lat, order.restaurant.location.lng] : null;
  const customerPos = order.customerLocation ? [order.customerLocation.lat, order.customerLocation.lng] : null;
  const riderPos = riderLocation ? [riderLocation.lat, riderLocation.lng] : null;
  
  // Map Logic: Show map if assigned OR onTheWay
  const isOrderActive = ['assigned', 'onTheWay'].includes(order.orderStatus);
  const showLiveMap = isOrderActive && riderPos && restaurantPos && customerPos;

  const bounds = [];
  if (restaurantPos) bounds.push(restaurantPos);
  if (customerPos) bounds.push(customerPos);
  if (riderPos) bounds.push(riderPos);

  return (
    <div className={`page-wrapper container ${styles.statusPage}`}>
      <div className={styles.statusHeader}>
        <h1>Order #{order._id.slice(-6)}</h1>
        {order.orderStatus !== 'cancelled' && (
            <p>Estimated Arrival: <strong>{estimatedTime}</strong></p>
        )}
      </div>

      <div className={styles.timelineContainer}>
        {Object.keys(statusConfig).map((statusKey, index) => {
          // Filter Logic
          if (statusKey === 'cancelled' && order.orderStatus !== 'cancelled') return null;
          if (order.orderStatus === 'cancelled' && statusKey !== 'cancelled' && statusKey !== 'pending') return null;

          const statusInfo = statusConfig[statusKey];
          const statusUpdate = order.statusHistory?.find(s => s.status === statusKey);
          const currentStatusIndex = Object.keys(statusConfig).indexOf(order.orderStatus);
          const thisIndex = Object.keys(statusConfig).indexOf(statusKey);

          let itemClass = styles.timelineItem;
          let icon = <Circle size={20} />;

          // Status Styling Logic
          if (order.orderStatus === 'cancelled' && statusKey === 'cancelled') {
             itemClass = `${styles.timelineItem} ${styles.cancelled}`;
             icon = <XCircle size={20} color="red" />;
          } else if (thisIndex < currentStatusIndex || order.orderStatus === 'completed') {
            itemClass = `${styles.timelineItem} ${styles.done}`;
            icon = <CheckCircle size={20} />;
          } else if (thisIndex === currentStatusIndex) {
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
                  <span className={styles.timestamp}>{statusUpdate ? formatTime(statusUpdate.timestamp) : ''}</span>
                </div>
                <p>{statusInfo.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.contactButtons}>
        {order.restaurant?.phone && <a href={`tel:${order.restaurant.phone}`} className={`${styles.callButton} ${styles.restaurantCall}`}>Call Restaurant</a>}
        {isOrderActive && order.assignedRider?.phone && <a href={`tel:${order.assignedRider.phone}`} className={`${styles.callButton} ${styles.riderCall}`}>Call Rider</a>}
      </div>

      <div className={styles.mapContainer}>
        {showLiveMap ? (
          <MapContainer center={customerPos} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
            <Marker position={restaurantPos} icon={RestaurantIcon}><Popup>Restaurant</Popup></Marker>
            <Marker position={customerPos} icon={CustomerIcon}><Popup>Your Location</Popup></Marker>
            <Marker position={riderPos} icon={RiderIcon}><Popup>Rider</Popup></Marker>
            <AutoZoom bounds={bounds} />
          </MapContainer>
        ) : (
          <div className={styles.mapPlaceholder}>
            <p>{order.orderStatus === 'cancelled' ? "This order has been cancelled." : "Live tracking available when rider is assigned."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatusPage;