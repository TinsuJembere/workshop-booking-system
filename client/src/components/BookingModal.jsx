import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BookingModal = ({ workshop, onClose, initialSlotId = "", isEditMode = false, onEditConfirm }) => {
  const [selectedSlot, setSelectedSlot] = useState(initialSlotId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleBooking = async () => {
    setLoading(true);
    setError("");
    try {
      if (isEditMode && onEditConfirm) {
        await onEditConfirm(selectedSlot);
        setLoading(false);
        onClose();
        return;
      }
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://workshop-booking-system-1.onrender.com/api/bookings",
        {
          workshopId: workshop.id,
          timeSlotId: selectedSlot,
          attendeeName: user.name,
          attendeeEmail: user.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLoading(false);
      onClose();
      navigate(`/booking-confirmed?confirmationId=${res.data.confirmationId}`);
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.error || (isEditMode ? "Failed to update booking." : "Booking failed. Please try again.")
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-2">
          {isEditMode ? `Edit Booking: ${workshop.title}` : `Book: ${workshop.title}`}
        </h2>
        <p className="text-gray-600 mb-4">{workshop.description}</p>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select a Time Slot:</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={selectedSlot}
            onChange={e => setSelectedSlot(e.target.value)}
          >
            <option value="">Choose a time slot</option>
            {workshop.timeSlots.map(slot => (
              <option key={slot.id} value={slot.id}>
                {slot.startTime} - {slot.endTime} ({slot.availableSpots} spots left)
              </option>
            ))}
          </select>
        </div>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            disabled={!selectedSlot || loading}
            onClick={handleBooking}
          >
            {loading ? (isEditMode ? "Saving..." : "Booking...") : (isEditMode ? "Save Changes" : "Confirm Booking")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal; 