import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookingModal from "./BookingModal";

const WorkshopCard = ({ workshop }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleBookNow = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      setShowModal(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <img
        src={workshop.image}
        alt={workshop.title}
        className="h-40 w-full object-cover"
      />
      <div className="p-4 flex-1 flex flex-col">
        <h2 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">{workshop.title}</h2>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{workshop.description}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs text-gray-500">{workshop.date}</span>
          <button
            className="ml-2 px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium transition"
            onClick={handleBookNow}
          >
            Book Now
          </button>
        </div>
      </div>
      {showModal && (
        <BookingModal
          workshop={workshop}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default WorkshopCard; 