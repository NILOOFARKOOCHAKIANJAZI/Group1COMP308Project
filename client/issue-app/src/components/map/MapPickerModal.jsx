import { useState } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import "./map.css";

export default function MapPickerModal({ onClose, onSelect }) {
  const [position, setPosition] = useState(null);

  const handleClick = (e) => {
    const lat = e.detail.latLng.lat;
    const lng = e.detail.latLng.lng;
    setPosition({ lat, lng });
  };

  const handleConfirm = async () => {
    if (!position) return;

    const { lat, lng } = position;

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    );

    const data = await res.json();

    const address = data.results[0]?.formatted_address || "";

    const city =
      data.results[0]?.address_components.find((c) =>
        c.types.includes("locality")
      )?.long_name || "";

    onSelect({
      latitude: lat,
      longitude: lng,
      address,
      neighborhood: city,
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Select Location</h3>

        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <Map
            style={{ width: "100%", height: "400px" }}
            defaultCenter={{ lat: 43.6532, lng: -79.3832 }}
            defaultZoom={12}
            gestureHandling="greedy"
            onClick={handleClick}
          >
            {position && <Marker position={position} />}
          </Map>
        </APIProvider>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-btn" onClick={handleConfirm}>
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}