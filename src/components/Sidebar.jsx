import React from "react";
import {
  X,
  Bookmark,
  Clock,
  Smartphone,
  BookOpen,
  Users,
  MapPin,
  Shield,
  Link as LinkIcon,
  Printer,
  Plus,
  Briefcase,
  Edit2,
  Lightbulb,
  HelpCircle,
  Info,
  Globe,
  SlidersHorizontal,
  Menu,
} from "lucide-react";

const menuSections = [
  // first section
  [
    { icon: <Bookmark size={20} />, label: "Saved" },
    { icon: <Clock size={20} />, label: "Recents" },
    { icon: <BookOpen size={20} />, label: "Your contributions" },
    { icon: <Users size={20} />, label: "Location sharing" },
    { icon: <MapPin size={20} />, label: "Your timeline" },
    { icon: <Shield size={20} />, label: "Your data in Maps" },
  ],
  // second section
  [
    { icon: <LinkIcon size={20} />, label: "Share or embed map" },
    { icon: <Printer size={20} />, label: "Print" },
    { icon: <Plus size={20} />, label: "Add a missing place" },
    { icon: <Briefcase size={20} />, label: "Add your business" },
    { icon: <Edit2 size={20} />, label: "Edit the map" },
  ],
  // third section
  [
    { icon: <Lightbulb size={20} />, label: "Tips and tricks" },
    { icon: <HelpCircle size={20} />, label: "Get help" },
    { icon: <Info size={20} />, label: "Consumer information" },
  ],
  // fourth section
  [
    { icon: <Globe size={20} />, label: "Language" },
    { icon: <SlidersHorizontal size={20} />, label: "Search settings" },
  ],
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay + Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <aside
            className="absolute left-0 top-0 h-full w-[300px] max-w-[90vw] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-bold">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </span>
                <span className="text-gray-700 font-semibold ml-1">Maps</span>
              </div>
              <button
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={onClose}
              >
                <X size={24} />
              </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto">
              {menuSections.map((section, i) => (
                <div key={i} className="border-b last:border-b-0">
                  {section.map((item) => (
                    <button
                      key={item.label}
                      className="flex items-center gap-4 w-full px-5 py-3 hover:bg-gray-50 text-gray-800"
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Static desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:top-0 md:left-0 md:h-full md:w-20 lg:w-24 bg-white shadow-lg z-20 py-4">
        <div className="flex flex-col items-center space-y-8">
          <Menu size={24} className="text-gray-700" />
          <Bookmark size={24} className="text-gray-700" />
          <Clock size={24} className="text-gray-400" />
          <Smartphone size={24} className="text-gray-700" />
        </div>
      </aside>
    </>
  );
}
