import React from "react";
import { Navigation2, Bookmark, MapPin, Smartphone, Share2 } from "lucide-react";

const PlaceDetailCard = ({ placeDetail, setShowDirections }) => {
  if (!placeDetail) return null;

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden mt-4">
      {placeDetail.photo && (
        <img
          src={placeDetail.photo}
          alt={placeDetail.name}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold">{placeDetail.name}</h2>
        <div
          className="text-gray-600 text-sm"
          dangerouslySetInnerHTML={{ __html: placeDetail.adr }}
        />
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setShowDirections(true)}
            className="flex flex-col items-center flex-1 text-blue-600"
          >
            <Navigation2 />
            <span className="text-xs">Directions</span>
          </button>
          <button className="flex flex-col items-center flex-1 text-gray-700">
            <Bookmark />
            <span className="text-xs">Save</span>
          </button>
          <button className="flex flex-col items-center flex-1 text-gray-700">
            <MapPin />
            <span className="text-xs">Nearby</span>
          </button>
          <button className="flex flex-col items-center flex-1 text-gray-700">
            <Smartphone />
            <span className="text-xs">Send</span>
          </button>
          <button className="flex flex-col items-center flex-1 text-gray-700">
            <Share2 />
            <span className="text-xs">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailCard;