import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import styles from './MenuPage.module.css';

function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function MapPickerModal({ onClose, onLocationSelect }) {
    const [position, setPosition] = useState(null);
    
    const handleConfirm = () => {
        if (position) {
            onLocationSelect(position);
            onClose();
        } else {
            alert("Please select a location on the map by clicking on it.");
        }
    };

    const initialPosition = useMemo(() => [6.9271, 79.8612], []); // Default to Colombo

    return (
        <div className={styles.modalBackdrop}>
            <div className={`${styles.modalContent} ${styles.mapModal}`}>
                <div className={styles.modalHeader}>
                    <h2>Select Delivery Location</h2>
                    <button onClick={onClose} className={styles.closeModalBtn}>×</button>
                </div>
                <p className={styles.mapInstruction}>Click on the map to set the destination.</p>
                <MapContainer center={initialPosition} zoom={13} scrollWheelZoom={true} className={styles.mapContainer}>
                    <TileLayer
                        attribution='&copy; <a href="http://googleusercontent.com/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
                <button onClick={handleConfirm} className={styles.placeOrderBtn}>Confirm Location</button>
            </div>
        </div>
    );
}