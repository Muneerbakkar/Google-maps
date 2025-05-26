import React from "react";
import { Home as HomeIcon, Clock, CloudRain, Car, ChevronRight } from "lucide-react";

const SuggestionsPanel = ({
  showSug,
  predictions,
  setOrigin,
  setShowSug,
  placeDetail,
  setQuery, // Add setQuery prop
  fetchDetails, // Add fetchDetails prop
}) => {
  if (!showSug) return null;

  return (
    <div className="w-full bg-transparent space-y-2">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {predictions.length > 0 ? (
          predictions.map((p) => (
            <div
              key={p.place_id}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setQuery(p.description); // Update the SearchBar query
                fetchDetails(p.place_id); // Fetch place details to show PlaceDetailCard
                setOrigin(p.description); // Set origin for DirectionsPanel
                setShowSug(false); // Hide SuggestionsPanel
              }}
            >
              <Clock size={18} className="text-gray-600 mr-3" />
              <span className="text-gray-800 text-sm">{p.description}</span>
            </div>
          ))
        ) : (
          <>
            <div className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer">
              <HomeIcon size={20} className="text-blue-600" />
              <span className="ml-2 flex-1 text-gray-800">Home</span>
              <button className="text-blue-600 text-sm">Set location</button>
            </div>
            <div className="flex items-center p-3 hover:bg-gray-100 cursor-pointer">
              <Clock size={20} className="text-gray-600" />
              <span className="ml-2 text-gray-800">restaurants</span>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-800 font-medium">Infopark Campus</span>
          <div className="flex items-center space-x-1">
            <span className="text-gray-800 font-medium">26°</span>
            <CloudRain size={20} className="text-gray-500" />
          </div>
        </div>
        <div className="flex items-center mt-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Car size={20} className="text-green-600" />
          </div>
          <div className="flex-1 ml-3">
            <div className="text-gray-800 font-medium">Light traffic in this area</div>
            <div className="text-gray-500 text-sm">Typical conditions</div>
          </div>
          <ChevronRight size={20} className="text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default SuggestionsPanel;