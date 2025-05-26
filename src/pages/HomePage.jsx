import React, { useState, useRef, useEffect } from "react";
import { Menu, Grid } from "lucide-react";
import { useJsApiLoader } from "@react-google-maps/api";

import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import CategoryPills from "../components/CategoryPills";
import SuggestionsPanel from "../components/SuggestionsPanel";
import PlaceDetailCard from "../components/PlaceDetailCard";
import DirectionsPanel from "../components/DirectionsPanel";
import MapComponent from "../components/MapComponent";

const defaultCenter = { lat: 9.9982, lng: 76.3577 };

export default function HomePage() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // Sidebar / search / directions state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [placeDetail, setPlaceDetail] = useState(null);

  const [showDirections, setShowDirections] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [travelMode, setTravelMode] = useState("DRIVING");
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [trafficColor, setTrafficColor] = useState("#1A73E8");
  const [selectedModeDuration, setSelectedModeDuration] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(null);

  const mapRef = useRef(null);

  // fetch place details
  const fetchDetails = (placeId) => {
    const svc = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );
    svc.getDetails(
      {
        placeId,
        fields: ["name", "formatted_address", "adr_address", "photos"],
      },
      (detail, status) => {
        if (status === "OK" && detail) {
          setPlaceDetail({
            name: detail.name,
            adr: detail.adr_address,
            address: detail.formatted_address,
            photo: detail.photos?.[0]?.getUrl({ maxWidth: 800 }) || null,
          });
          setShowSug(false);
          setShowDirections(false);
        }
      }
    );
  };

  useEffect(() => {
    if (placeDetail) {
      setDestination(placeDetail.address);
    }
  }, [placeDetail]);

  // Function to clear route-related state
  const clearRouteState = () => {
    setDirectionsResponse(null);
    setSelectedModeDuration(null);
    setTrafficColor("#1A73E8");
    setTooltipPosition(null);
  };

  // Modified setTravelMode to clear old state before updating
  const handleTravelModeChange = (newMode) => {
    if (travelMode !== newMode) {
      clearRouteState();
      setTravelMode(newMode);
    }
  };

  // calculate route & traffic color
  // In HomePage.jsx
  const calculateRoute = () => {
    if (!origin || !destination) return;
    const svc = new window.google.maps.DirectionsService();
    svc.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode[travelMode],
        ...(travelMode === "DRIVING" && { provideRouteAlternatives: false }),
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirectionsResponse(result);

          const leg = result.routes[0].legs[0];
          const base = leg.duration.value; // secs without traffic
          const traffic = leg.duration_in_traffic?.value || base; // secs with traffic
          const ratio = traffic / base;

          // if heavy traffic → red, moderate → yellow, else (normal) → blue
          setTrafficColor(
            ratio > 1.5
              ? "#EA4335" // red
              : ratio > 1.2
              ? "#FBBC05" // yellow
              : "#3366FF" // blue for normal
          );

          setSelectedModeDuration(
            leg.duration_in_traffic?.text || leg.duration.text
          );

          const path = result.routes[0].overview_path;
          setTooltipPosition(path[Math.floor(path.length / 2)]);
        } else {
          // no route or error → clear & default to blue
          setDirectionsResponse(null);
          setSelectedModeDuration(null);
          setTrafficColor("#3366FF");
          setTooltipPosition(null);
        }
      }
    );
  };

  // Recalculate route whenever travelMode, origin, or destination changes
  useEffect(() => {
    if (showDirections && origin && destination) {
      calculateRoute();
    }
  }, [travelMode, origin, destination, showDirections]);

  // close / clear
  const closeDirections = () => {
    console.log("Closing DirectionsPanel...");
    setShowDirections(false);
    setOrigin("");
    setDestination("");
    setTravelMode("DRIVING");
    // Do not clear directionsResponse to keep the route on the map
    setPlaceDetail(null);
    setTrafficColor("#1A73E8");
    setSelectedModeDuration(null);
    setShowTooltip(false);
  };

  const clearDirections = () => {
    setOrigin("");
    setDestination("");
    setTravelMode("DRIVING");
    setDirectionsResponse(null); // Clear the route from the map
    setTrafficColor("#1A73E8");
    setSelectedModeDuration(null);
    setShowTooltip(false);
    mapRef.current?.setCenter(defaultCenter);
    mapRef.current?.setZoom(14);
  };

  return (
    <div className="relative flex flex-col h-screen w-full">
      {/* Sidebar overlay + static */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ===== MOBILE TOP BAR + PILLS (only < md) ===== */}
      <div className="absolute top-4 left-2 right-2 z-30 md:hidden">
        {/* Top bar */}
        <div className="flex items-center gap-2 bg-white rounded-full shadow px-2 py-1">
          {/* Hamburger */}
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} className="text-gray-700" />
          </button>

          {/* Search */}
          <div className="flex-1 min-w-0">
            <SearchBar
              query={query}
              setQuery={setQuery}
              setPlaceDetail={setPlaceDetail}
              setDirectionsResponse={setDirectionsResponse}
              setShowDirections={setShowDirections}
              setTrafficColor={setTrafficColor}
              setSelectedModeDuration={setSelectedModeDuration}
              setShowTooltip={setShowTooltip}
              mapRef={mapRef}
              defaultCenter={defaultCenter}
              predictions={predictions}
              setPredictions={setPredictions}
              showSug={showSug}
              setShowSug={setShowSug}
              fetchDetails={fetchDetails}
              isLoaded={isLoaded}
            />
          </div>
          {/* User avatar */}
          <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center font-semibold text-white">
            M
          </div>
        </div>

        {/* Pills row */}
        <div className="mt-3">
          <CategoryPills />
        </div>
      </div>

      {/* ===== MOBILE PANELS (only < md) ===== */}
      <div
        className={`absolute left-2 right-2 z-20 md:hidden max-h-[50vh] overflow-auto space-y-3 px-2 pointer-events-none transition-all duration-300 ${
          showDirections
            ? "fixed bottom-0 bg-gray-100 shadow-lg rounded-t-lg"
            : "top-[calc(4rem+3.5rem)]"
        }`}
      >
        <div className="pointer-events-auto">
          {/* Only show SuggestionsPanel when DirectionsPanel is not active */}
          {!showDirections && (
            <SuggestionsPanel
              showSug={showSug}
              predictions={predictions}
              setOrigin={setOrigin}
              setShowSug={setShowSug}
              placeDetail={placeDetail}
              setQuery={setQuery}
              fetchDetails={fetchDetails}
            />
          )}
          <PlaceDetailCard
            placeDetail={placeDetail}
            setShowDirections={setShowDirections}
          />
          <DirectionsPanel
            showDirections={showDirections}
            origin={origin}
            setOrigin={setOrigin}
            destination={destination}
            setDestination={setDestination}
            travelMode={travelMode}
            setTravelMode={handleTravelModeChange}
            directionsResponse={directionsResponse}
            calculateRoute={calculateRoute}
            closeDirections={closeDirections}
            clearDirections={clearDirections}
            selectedModeDuration={selectedModeDuration}
            predictions={predictions}
            setShowSug={setShowSug}
            isLoaded={isLoaded}
          />
        </div>
      </div>

      {/* ===== DESKTOP CONTROLS (only ≥ md) ===== */}
      <div className="absolute top-16 left-36 right-4 z-20 hidden md:block pointer-events-none">
        <div className="flex flex-col space-y-4 pointer-events-auto">
          <div className="flex flex-col items-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
            <div className="w-full md:w-auto md:max-w-xl flex-1 min-w-0">
              <SearchBar
                query={query}
                setQuery={setQuery}
                setPlaceDetail={setPlaceDetail}
                setDirectionsResponse={setDirectionsResponse}
                setShowDirections={setShowDirections}
                setTrafficColor={setTrafficColor}
                setSelectedModeDuration={setSelectedModeDuration}
                setShowTooltip={setShowTooltip}
                mapRef={mapRef}
                defaultCenter={defaultCenter}
                predictions={predictions}
                setPredictions={setPredictions}
                showSug={showSug}
                setShowSug={setShowSug}
                fetchDetails={fetchDetails}
                isLoaded={isLoaded}
              />
            </div>
            <div className="flex-shrink-0 hidden md:flex">
              <CategoryPills />
            </div>
            <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center font-semibold text-white">
              M
            </div>
          </div>
          <div className="w-full md:max-w-xl max-h-[60vh] overflow-auto">
            <SuggestionsPanel
              showSug={showSug}
              predictions={predictions}
              setOrigin={setOrigin}
              setShowSug={setShowSug}
              placeDetail={placeDetail}
              setQuery={setQuery}
              fetchDetails={fetchDetails}
            />
            <PlaceDetailCard
              placeDetail={placeDetail}
              setShowDirections={setShowDirections}
            />
            <DirectionsPanel
              showDirections={showDirections}
              origin={origin}
              setOrigin={setOrigin}
              destination={destination}
              setDestination={setDestination}
              travelMode={travelMode}
              setTravelMode={handleTravelModeChange}
              directionsResponse={directionsResponse}
              calculateRoute={calculateRoute}
              closeDirections={closeDirections}
              clearDirections={clearDirections}
              selectedModeDuration={selectedModeDuration}
              predictions={predictions}
              setShowSug={setShowSug}
              isLoaded={isLoaded}
            />
          </div>
        </div>
      </div>

      {/* ===== MAP ===== */}
      <MapComponent
        isLoaded={isLoaded}
        loadError={loadError}
        showDirections={showDirections}
        directionsResponse={directionsResponse}
        trafficColor={trafficColor}
        travelMode={travelMode}
        showTooltip={showTooltip}
        setShowTooltip={setShowTooltip}
        tooltipPosition={tooltipPosition}
        mapRef={mapRef}
      />
    </div>
  );
}
