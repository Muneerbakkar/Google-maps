// src/components/MapComponent.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  TrafficLayer,
  TransitLayer,
  BicyclingLayer,
  OverlayView,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { Locate } from "lucide-react";

const containerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 9.9982, lng: 76.3577 };

const MapComponent = ({
  isLoaded,
  loadError,
  showDirections,
  directionsResponse,
  trafficColor = "#3366FF",
  travelMode,
  showTooltip,
  setShowTooltip,
  tooltipPosition,
  mapRef,
}) => {
  const directionsRendererRef = useRef(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [mapType, setMapType] = useState("roadmap"); // "roadmap" or "satellite"

  // Initialize or update the DirectionsRenderer
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map: mapRef.current,
        suppressMarkers: false,
      });
    }
    const dr = directionsRendererRef.current;

    if (showDirections && directionsResponse) {
      dr.setDirections(directionsResponse);
      dr.setOptions({
        polylineOptions: {
          strokeColor: trafficColor,
          strokeOpacity: 0.8,
          strokeWeight: 6,
        },
      });
    } else {
      dr.setDirections(null);
    }
  }, [isLoaded, showDirections, directionsResponse, trafficColor]);

  // Pan & zoom to user location, then save for Marker
  const panToCurrent = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude };
        setCurrentPosition(pos);
        mapRef.current.panTo(pos);
        mapRef.current.setZoom(15);
      },
      (err) => console.error("Geolocation error:", err)
    );
  };

  if (loadError)
    return (
      <div className="p-4 text-red-600">
        Error loading map: {loadError.message}
      </div>
    );
  if (!isLoaded) return <div className="p-4">Loading map…</div>;

  return (
    <div className="relative w-full h-full">
      {/* Map/Satellite toggle */}
      <div className="absolute bottom-4 left-4 md:left-36 z-10 flex overflow-hidden border bg-white shadow-sm">
        <button
          onClick={() => setMapType("roadmap")}
          className={`px-3 py-1 text-sm ${
            mapType === "roadmap"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setMapType("satellite")}
          className={`px-3 py-1 text-sm ${
            mapType === "satellite"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Satellite
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={14}
        mapTypeId={mapType}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
        onLoad={(map) => {
          mapRef.current = map;
        }}
      >
        {/* Layers */}
        <TrafficLayer autoRefresh />
        <TransitLayer />
        <BicyclingLayer />

        {/* Directions route */}
        {showDirections && directionsResponse && (
          <DirectionsRenderer
            options={{
              directions: directionsResponse,
              polylineOptions: {
                strokeColor: trafficColor,
                strokeWeight: 6,
                strokeOpacity: 0.8,
              },
            }}
          />
        )}

        {/* Tooltip Overlay for driving-time */}
        {travelMode === "DRIVING" &&
          showTooltip &&
          tooltipPosition &&
          directionsResponse && (
            <OverlayView
              position={tooltipPosition}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div
                className="bg-white px-3 py-1 rounded-full shadow-lg text-sm font-medium text-gray-800"
                onClick={() => setShowTooltip(false)}
              >
                {directionsResponse.routes[0].legs[0].duration_in_traffic?.text ||
                  directionsResponse.routes[0].legs[0].duration.text ||
                  "N/A"}
              </div>
            </OverlayView>
          )}

        {/* Custom SVG pin marker for current location */}
        {currentPosition && (
          <Marker
            position={currentPosition}
            icon={{
              path:
                "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" +
                "M12 11.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z",
              fillColor: "#1976D2",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 2,
              anchor: new window.google.maps.Point(12, 24),
            }}
          />
        )}
      </GoogleMap>

      {/* Locate-me button */}
      <button
        onClick={panToCurrent}
        className="absolute bottom-48 right-2 z-10 p-3 bg-white rounded-full shadow hover:bg-gray-100"
      >
        <Locate size={20} className="text-blue-600" />
      </button>
    </div>
  );
};

export default MapComponent;
