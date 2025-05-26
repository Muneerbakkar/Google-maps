import React, { useState, useEffect, useRef } from "react";
import { Search, X, Navigation2, MapPin } from "lucide-react";

const SearchBar = ({
  query,
  setQuery,
  setPlaceDetail,
  setDirectionsResponse,
  setShowDirections,
  setTrafficColor,
  setSelectedModeDuration,
  setShowTooltip,
  mapRef,
  defaultCenter,
  predictions,
  setPredictions,
  showSug,
  setShowSug,
  fetchDetails,
  isLoaded,
}) => {
  const acService = useRef(null);

  useEffect(() => {
    if (isLoaded && !acService.current) {
      acService.current = new window.google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!acService.current || !showSug || !query) {
      setPredictions([]);
      return;
    }
    acService.current.getPlacePredictions(
      { input: query, componentRestrictions: { country: "in" } },
      (res, status) => setPredictions(status === "OK" ? res : [])
    );
  }, [query, showSug, setPredictions]);

  const handleClear = () => {
    setQuery("");
    setPlaceDetail(null);
    setDirectionsResponse(null);
    setShowDirections(false);
    setTrafficColor("#1A73E8");
    setSelectedModeDuration(null);
    setShowTooltip(false);
    setShowSug(false); // Ensure dropdown is hidden
    if (mapRef.current) {
      mapRef.current.setCenter(defaultCenter);
      mapRef.current.setZoom(14);
    }
  };

  const handleSelectPrediction = (prediction) => {
    setQuery(prediction.description);
    // Pass a callback to fetchDetails to center the map
    fetchDetails(prediction.place_id, (coordinates) => {
      if (mapRef.current && coordinates) {
        mapRef.current.setCenter(coordinates);
        mapRef.current.setZoom(16); // Zoom in to the selected location
      }
    });
    setShowSug(false); // Hide the dropdown
  };

  return (
    <div className="relative w-full">
      <div className="flex justify-between items-center bg-white rounded-full shadow px-4 py-2 w-full">
        <div className="flex items-center w-full">
          <Search size={18} className="text-gray-500 mr-2 flex-shrink-0" />
          <input
            className="flex-1 text-sm outline-none"
            placeholder="Search Google Maps"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSug(true)}
            onBlur={() => setTimeout(() => setShowSug(false), 200)}
          />
          {query ? (
            <X
              size={18}
              className="text-gray-500 ml-2 cursor-pointer flex-shrink-0"
              onClick={handleClear}
            />
          ) : (
            ""
          )}
        </div>
      </div>
      {/* {showSug && predictions.length > 0 && (
        <div className="absolute w-full bg-white rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-auto">
          {predictions.map((p) => (
            <div
              key={p.place_id}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectPrediction(p)}
            >
              <MapPin size={18} className="text-gray-500 mr-3" />
              <span className="text-gray-800 text-sm">{p.description}</span>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
};

export default SearchBar;
