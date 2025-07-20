import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BookingModal from "../components/BookingModal";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBooking, setEditingBooking] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    attendeeName: '',
    attendeeEmail: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.attendeeName || !editFormData.attendeeEmail) {
      toast.error('Please fill in all fields');
      return;
    }
    await handleUpdate(editingBooking.id, editFormData);
    setShowEditModal(false);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditFormData({
      attendeeName: '',
      attendeeEmail: ''
    });
  };

  const handleShowDeleteModal = (bookingId) => {
    setBookingToDelete(bookingId);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setBookingToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (!bookingToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/bookings/${bookingToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(prev => prev.filter(b => b.id !== bookingToDelete));
      toast.success('Booking canceled successfully');
    } catch (err) {
      toast.error('Failed to cancel booking');
    } finally {
      handleCloseDeleteModal();
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(prev => prev.filter(b => b.id !== bookingId)); // Remove from UI
      toast.success('Booking canceled successfully');
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  const handleUpdate = async (bookingId, updatedData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/bookings/${bookingId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchBookings();
      setEditingBooking(null);
      toast.success('Booking updated successfully');
    } catch (err) {
      toast.error('Failed to update booking');
    }
  };

  const handleEditBooking = async (selectedSlotId) => {
    if (!editingBooking) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/bookings/${editingBooking.id}`, {
        timeSlotId: selectedSlotId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Booking updated successfully");
      setShowEditModal(false);
      setEditingBooking(null);
      // Refresh bookings
      const res = await axios.get("/api/bookings/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err) {
      toast.error("Failed to update booking");
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/bookings/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
      } catch (err) {
        setError("Failed to load your bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <div className="text-center py-12">Loading your bookings...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
      {bookings.filter(b => b.status === 'CONFIRMED').length === 0 ? (
        <div className="text-center text-gray-500">You have no bookings yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.filter(b => b.status === 'CONFIRMED').map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col relative">
              <img
                src={
                  booking.workshop.image
                    ? booking.workshop.image.startsWith('/uploads/')
                      ? 'https://workshop-booking-system-1.onrender.com' + booking.workshop.image
                      : booking.workshop.image
                    : '/1.png'
                }
                alt={booking.workshop.title}
                className="h-32 w-full object-cover rounded mb-4"
              />
              <h3 className="text-lg font-semibold mb-1">{booking.workshop.title}</h3>
              <div className="text-gray-600 text-sm mb-2">{booking.workshop.description}</div>
              <div className="text-xs text-gray-500 mb-1">Date: {new Date(booking.workshop.date).toLocaleString()}</div>
              <div className="text-xs text-gray-500 mb-1">Time Slot: {booking.timeSlot.startTime} - {booking.timeSlot.endTime}</div>
              <div className="text-xs text-gray-500 mb-1">Booking Code: {booking.bookingCode}</div>
              <div className="text-xs text-gray-500 mb-1">Status: <span className="font-semibold">{booking.status}</span></div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEdit(booking)}
                  className="flex items-center gap-1 text-white "
                >
                  <span role="img" aria-label="edit">✏️</span>
                </button>
                <button
                  onClick={() => handleShowDeleteModal(booking.id)}
                  className="flex items-center gap-1 text-white "
                >
                  <span role="img" aria-label="cancel">❌</span> 
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showEditModal && editingBooking && (
        <BookingModal
          workshop={{
            ...editingBooking.workshop,
            timeSlots: editingBooking.workshop.timeSlots || [],
          }}
          onClose={handleCloseEditModal}
          initialSlotId={editingBooking.timeSlot?.id}
          onEditConfirm={handleEditBooking}
          isEditMode={true}
        />
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs mt-8 mr-8 relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={handleCloseDeleteModal}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-2">Cancel Booking</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={handleCloseDeleteModal}
              >
                No, Keep Booking
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleConfirmDelete}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings; 