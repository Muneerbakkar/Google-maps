import React from "react";
import {
  Utensils,
  Hotel,
  Map as ThingsToDoIcon,
  Building,
  Train,
  Pill,
  CreditCard,
  Grid,
} from "lucide-react";

const categoryIcons = {
  Restaurants: <Utensils size={16} />,
  Hotels: <Hotel size={16} />,
  "Things to do": <ThingsToDoIcon size={16} />,
  Museums: <Building size={16} />,
  Transit: <Train size={16} />,
  Pharmacies: <Pill size={16} />,
  ATMs: <CreditCard size={16} />,
};

const categories = [
  "Restaurants",
  "Hotels",
  "Things to do",
  "Museums",
  "Transit",
  "Pharmacies",
  "ATMs",
];

export default function CategoryPills() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
      {categories.map((cat) => (
        <button
          key={cat}
          className="flex items-center bg-white px-3 py-1 rounded-full shadow text-sm whitespace-nowrap hover:bg-gray-100"
        >
          {categoryIcons[cat]}
          <span className="ml-1">{cat}</span>
        </button>
      ))}
      <button className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
        <Grid size={20} />
      </button>
    </div>
  );
}
