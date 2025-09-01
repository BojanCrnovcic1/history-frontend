import React, { useState, useRef } from "react";
import axios from "axios";
import type { Locations } from "../../../types/Locations";
import { ApiConfig } from "../../../config/ApiConfig";
import { useAuth } from "../../../context/AuthContext";
import "./createLocation.scss";

const MAP_BOUNDS = {
  north: 60,
  south: 25,
  west: -10,
  east: 65,
};

const CreateLocation: React.FC = () => {
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const { accessToken } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMarker({ x, y });
  };

  // pikseli → koordinate (koristi trenutne dimenzije mape)
  const pixelToCoords = (x: number, y: number, rectWidth: number, rectHeight: number) => {
    const lon =
      MAP_BOUNDS.west + (x / rectWidth) * (MAP_BOUNDS.east - MAP_BOUNDS.west);
    const lat =
      MAP_BOUNDS.north - (y / rectHeight) * (MAP_BOUNDS.north - MAP_BOUNDS.south);
    return { lat, lon };
  };

  let lat = 0, lon = 0;
  if (marker && mapRef.current) {
    const coords = pixelToCoords(marker.x, marker.y, mapRef.current.clientWidth, mapRef.current.clientHeight);
    lat = coords.lat;
    lon = coords.lon;
  }

  const saveLocation = async () => {
    if (!name || !marker || !mapRef.current) {
      alert("Unesi ime lokacije i klikni na mapu!");
      return;
    }
    setSaving(true);
    try {
      const dto: Omit<Locations, "locationId" | "events"> = {
        name,
        latitude: lat.toString(),
        longitude: lon.toString(),
      };

      const response = await axios.post(ApiConfig.API_URL + "api/locations", dto, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      alert("Sačuvano: " + JSON.stringify(response.data));
    } catch (error) {
      console.error(error);
      alert("Greška pri snimanju!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-location">
      <input
        type="text"
        placeholder="Name location"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="map" ref={mapRef} onClick={handleMapClick}>
        <img src="/assets/map.png" alt="Mapa" className="map-image" />
        {marker && (
          <div
            className="marker"
            style={{ left: marker.x, top: marker.y }}
          >
            +
          </div>
        )}
      </div>
      

      {marker && (
        <div className="coords">
          Lat: {lat.toFixed(4)}, Lon: {lon.toFixed(4)}
        </div>
      )}

      <button onClick={saveLocation} disabled={saving}>
        {saving ? "Saving..." : "Save Location"}
      </button>
    </div>
  );
};

export default CreateLocation;
