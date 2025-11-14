import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';
import styles from './MapPickerModal.module.css';
import { LocateFixed } from 'lucide-react'; // (!!!) ALUTH ICON EKA IMPORT KALA

// --- LEAFLET CSS ---
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

// --- (!!!) VITE FIX EKA (require -> import) ---
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// --- Leaflet icon fix ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
// -------------------------

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

export default function MapPickerModal({ onClose, onLocationSelect }) {
  const [position, setPosition] = useState({ lat: 6.9271, lng: 79.8612 });

  const handleSetPosition = useCallback((latlng) => {
    setPosition(latlng);
  }, []);

  const MapEvents = () => {
    const map = useMap();
    useEffect(() => {
      if (map) {
        map.flyTo(position, 15);
      }
    }, [position, map]);
    return null;
  }

  const handleConfirmLocation = () => {
    onLocationSelect(position);
    onClose();
  };

  // --- (!!!) ALUTH FUNCTION EKA - "FIND ME" ---
  const handleFindMe = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleSetPosition({ lat: latitude, lng: longitude });
      },
      () => {
        alert('Could not get your location. Please check browser permissions.');
      }
    );
  };
  // ---------------------------------------------

  return ReactDOM.createPortal(
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <SearchField onLocationSelect={handleSetPosition} />
          <MapClickHandler setPosition={handleSetPosition} />
          <Marker position={position} />
          <MapEvents />
        </MapContainer>

        {/* --- UI Buttons --- */}
        
        {/* (!!!) ALUTH "FIND ME" BUTTON EKA */}
        <button 
          className={`${styles.uiButton} ${styles.findMeButton}`} 
          onClick={handleFindMe}
          title="Use My Current Location"
        >
          <LocateFixed size={20} />
        </button>

        <button className={`${styles.uiButton} ${styles.closeButton}`} onClick={onClose}>
          &times;
        </button>

        <div className={styles.confirmContainer}>
          <button className={styles.confirmButton} onClick={handleConfirmLocation}>
            Confirm This Location
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}