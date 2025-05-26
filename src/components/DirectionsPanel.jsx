import React, { useState, useEffect, useRef } from "react";
import {
  Car,
  Bike,
  MapPin,
  X,
  Clock,
  AlertTriangle,
  Home as HomeIcon,
} from "lucide-react";

// Helper function to calculate arrival time
const calculateArrivalTime = (durationText, currentTime) => {
  if (!durationText) return "N/A";

  let minutes = 0;
  const hoursMatch = durationText.match(/(\d+)\s*hour/);
  const minsMatch = durationText.match(/(\d+)\s*min/);

  if (hoursMatch) {
    minutes += parseInt(hoursMatch[1], 10) * 60;
  }
  if (minsMatch) {
    minutes += parseInt(minsMatch[1], 10);
  }

  const currentDate = new Date("2025-05-26T02:25:00+05:30"); // IST is UTC+5:30
  currentDate.setMinutes(currentDate.getMinutes() + minutes);

  return currentDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Helper function to get traffic label based on color
const getTrafficLabel = (trafficColor) => {
  switch (trafficColor) {
    case "#34C759":
      return "Light traffic";
    case "#FBBC05":
      return "Moderate traffic";
    case "#EA4335":
      return "Heavy traffic";
    default:
      return "Traffic data unavailable";
  }
};

// Helper function to get travel mode icon
const getTravelModeIcon = (travelMode) => {
  switch (travelMode) {
    case "DRIVING":
      return <Car size={16} className="text-gray-600" />;
    case "TWO_WHEELER":
      return <Bike size={16} className="text-gray-600" />;
    case "WALKING":
      return <MapPin size={16} className="text-gray-600" />;
    default:
      return null;
  }
};

const DirectionsPanel = ({
  showDirections,
  origin,
  setOrigin,
  destination,
  setDestination,
  travelMode,
  setTravelMode,
  directionsResponse,
  calculateRoute,
  closeDirections,
  clearDirections,
  selectedModeDuration,
  predictions,
  setShowSug,
  isLoaded,
  trafficColor,
}) => {
  const [showOriginSug, setShowOriginSug] = useState(false);
  const [showDestinationSug, setShowDestinationSug] = useState(false);
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [originInput, setOriginInput] = useState(""); // New state for input field
  const acService = useRef(null);

  const hasTrafficData = travelMode === "DRIVING" && trafficColor !== "#34C759";
  const trafficDelaysDetected = hasTrafficData && (trafficColor === "#FBBC05" || trafficColor === "#EA4335");

  // Reset originInput when the panel opens
  useEffect(() => {
    if (showDirections) {
      setOriginInput(""); // Ensure the input is empty when the panel opens
    }
  }, [showDirections]);

  useEffect(() => {
    if (isLoaded && !acService.current) {
      acService.current = new window.google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!acService.current || !showOriginSug || !originInput) {
      setOriginSuggestions([]);
      return;
    }
    acService.current.getPlacePredictions(
      { input: originInput, componentRestrictions: { country: "in" } },
      (res, status) => setOriginSuggestions(status === "OK" ? res : [])
    );
  }, [originInput, showOriginSug]);

  useEffect(() => {
    if (!acService.current || !showDestinationSug || !destination) {
      setDestinationSuggestions([]);
      return;
    }
    acService.current.getPlacePredictions(
      { input: destination, componentRestrictions: { country: "in" } },
      (res, status) => setDestinationSuggestions(status === "OK" ? res : [])
    );
  }, [destination, showDestinationSug]);

  useEffect(() => {
    if (!showDirections) {
      setShowOriginSug(false);
      setShowDestinationSug(false);
      setOriginSuggestions([]);
      setDestinationSuggestions([]);
    }
  }, [showDirections]);

  // Handle clicking on a prediction
  const handlePredictionClick = (description) => {
    setOrigin(description); // Update origin for routing
    setOriginInput(""); // Keep the input field empty
    setShowSug(false);
  };

  // Handle clicking on an origin suggestion from autocomplete
  const handleOriginSuggestionClick = (description) => {
    setOrigin(description); // Update origin for routing
    setOriginInput(description); // Populate input field with suggestion
    setShowOriginSug(false);
  };

  if (!showDirections) return null;

  return (
    <div className="w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex space-x-4 overflow-x-auto">
          {[
            { mode: "DRIVING", icon: <Car size={20} />, label: "Driving" },
            { mode: "TWO_WHEELER", icon: <Bike size={20} />, label: "Two-wheeler" },
            { mode: "WALKING", icon: <MapPin size={20} />, label: "Walking" },
          ].map(({ mode, icon, label }) => (
            <button
              key={mode}
              onClick={() => setTravelMode(mode)}
              className={`flex-shrink-0 p-1 flex flex-col items-center ${
                travelMode === mode
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              {icon}
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          {/* <button
            onClick={clearDirections}
            className="text-gray-600 text-sm hover:text-gray-800"
          >
            Clear
          </button> */}
          <X
            size={20}
            className="text-gray-600 cursor-pointer"
            onClick={closeDirections}
          />
        </div>
      </div>
      <div className="px-4 py-3 space-y-3">
        <div className="relative">
          <div className="flex items-center border rounded-full px-3 py-2">
            <input
              type="radio"
              checked={!originInput}
              readOnly
              className="mr-2 text-blue-600"
            />
            <input
              type="text"
              placeholder="Choose starting point, or click on the map"
              value={originInput} // Use originInput instead of origin
              onChange={(e) => {
                setOriginInput(e.target.value);
                setOrigin(e.target.value); // Sync origin with input
              }}
              onFocus={() => setShowOriginSug(true)}
              onBlur={() => setTimeout(() => setShowOriginSug(false), 200)}
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          {showOriginSug && originSuggestions.length > 0 && (
            <div className="absolute w-full bg-white rounded-lg shadow-lg mt-1 z-10">
              {originSuggestions.map((p) => (
                <div
                  key={p.place_id}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleOriginSuggestionClick(p.description)}
                >
                  <MapPin size={18} className="text-gray-600 mr-3" />
                  <span className="text-gray-800 text-sm">{p.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <div className="flex items-center border rounded-full px-3 py-2">
            <MapPin size={18} className="text-gray-600 mr-2" />
            <input
              type="text"
              placeholder="Choose destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() => setShowDestinationSug(true)}
              onBlur={() => setTimeout(() => setShowDestinationSug(false), 200)}
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          {showDestinationSug && destinationSuggestions.length > 0 && (
            <div className="absolute w-full bg-white rounded-lg shadow-lg mt-1 z-10">
              {destinationSuggestions.map((p) => (
                <div
                  key={p.place_id}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setDestination(p.description);
                    setShowDestinationSug(false);
                  }}
                >
                  <MapPin size={18} className="text-gray-600 mr-3" />
                  <span className="text-gray-800 text-sm">{p.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={calculateRoute}
          className="w-full bg-blue-600 text-white py-2 rounded-full"
        >
          Go
        </button>

        {directionsResponse ? (
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg text-sm">
            <div>{getTravelModeIcon(travelMode)}</div>
            <div className="flex-1">
              <span className="font-medium text-gray-800">
                {directionsResponse.routes[0].legs[0].distance.text}
              </span>
              <span className="mx-1 text-gray-500">•</span>
              <span className="font-medium text-gray-800">
                {selectedModeDuration}
              </span>
              <span className="mx-1 text-gray-500">•</span>
              <span className="text-gray-600">
                Arrive by {calculateArrivalTime(selectedModeDuration, new Date())}
              </span>
              {hasTrafficData ? (
                <>
                  <span className="mx-1 text-gray-500">•</span>
                  <div className="inline-flex items-center space-x-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: trafficColor }}
                    />
                    <span className="text-gray-600">{getTrafficLabel(trafficColor)}</span>
                  </div>
                </>
              ) : travelMode === "DRIVING" ? (
                <>
                  <span className="mx-1 text-gray-500">•</span>
                  <span className="text-gray-600">Traffic data unavailable</span>
                </>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="p-2 text-sm text-gray-600">
            Select a travel mode and click "Go" to see the route.
          </div>
        )}
      </div>
      <ul className="px-4 space-y-2 max-h-40 overflow-auto touch-action-none">
        {predictions.length > 0
          ? predictions.map((p) => (
              <li
                key={p.place_id}
                className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => handlePredictionClick(p.description)}
              >
                <MapPin size={18} className="text-gray-600 mr-3" />
                <span className="text-gray-800 text-sm">{p.description}</span>
              </li>
            ))
          : [
              {
                icon: <HomeIcon size={18} className="text-blue-600" />,
                text: "Your location",
              },
              {
                icon: <Clock size={18} className="text-gray-600" />,
                text: "Recent search",
              },
              {
                icon: <Clock size={18} className="text-gray-600" />,
                text: "Cotolore Enterprises LLP…",
              },
            ].map(({ icon, text }, i) => (
              <li
                key={i}
                className="flex items-center px-3 py-2 hover:bg-gray-100 rounded"
              >
                {icon}
                <span className="ml-2 text-gray-800 text-sm">{text}</span>
              </li>
            ))}
      </ul>
      <div className="px-4 py-3 border-t">
        <h4 className="font-medium text-gray-800 mb-1">Delays</h4>
        <p className="text-sm text-gray-600">Light traffic in this area</p>
        <p className="text-sm text-gray-600 mt-1">
          No known road disruptions. Traffic incidents will show up here.
        </p>
      </div>
    </div>
  );
};

export default DirectionsPanel;