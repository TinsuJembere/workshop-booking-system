import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";

const BookingConfirmed = () => {
  const [searchParams] = useSearchParams();
  const confirmationId = searchParams.get("confirmationId");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!confirmationId) {
      setError("No confirmation ID provided.");
      setLoading(false);
      return;
    }
    const fetchBooking = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/api/bookings/${confirmationId}`);
        setBooking(res.data);
      } catch (err) {
        setError("Booking not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [confirmationId]);

  if (loading) return <div className="text-center py-12">Loading booking details...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;
  if (!booking) return null;

  const handleAddToCalendar = () => {
    if (!booking) return;
    const start = new Date(booking.workshop.date + 'T' + booking.timeSlot.startTime);
    const end = new Date(booking.workshop.date + 'T' + booking.timeSlot.endTime);
    const pad = n => n.toString().padStart(2, '0');
    const formatDate = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${booking.workshop.title}\nDESCRIPTION:${booking.workshop.description}\nDTSTART:${formatDate(start)}\nDTEND:${formatDate(end)}\nLOCATION:Online/Workshop Venue\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${booking.workshop.title}-booking.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTicket = () => {
    if (!booking) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Workshop Ticket', 20, 20);
    doc.setFontSize(12);
    doc.text(`Workshop: ${booking.workshop.title}`, 20, 35);
    doc.text(`Description: ${booking.workshop.description}`, 20, 45);
    doc.text(`Date: ${new Date(booking.workshop.date).toLocaleString()}`, 20, 55);
    doc.text(`Time: ${booking.timeSlot.startTime} - ${booking.timeSlot.endTime}`, 20, 65);
    doc.text(`Attendee: ${booking.attendeeName}`, 20, 75);
    doc.text(`Email: ${booking.attendeeEmail}`, 20, 85);
    doc.text(`Booking Code: ${booking.bookingCode}`, 20, 95);
    doc.text(`Number of Attendees: ${booking.numAttendees}`, 20, 105);
    doc.save(`${booking.workshop.title}-ticket.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto flex flex-col lg:flex-row gap-8 py-10">
        {/* Main Card */}
        <div className="flex-1 bg-white rounded-xl shadow p-8 mb-8 lg:mb-0">
          <div className="flex items-center mb-4">
            <span className="text-green-600 mr-2">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M8 12l2 2l4-4" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
            </span>
            <h2 className="text-xl font-semibold">Booking Confirmed!</h2>
          </div>
          <p className="mb-4 text-gray-600">Your reservation for the workshop has been successfully confirmed.</p>
          <img src={booking.workshop.image || "/1.png"} alt="Workshop" className="rounded-lg w-full h-48 object-cover mb-4" />
          <h3 className="text-lg font-bold mb-2">{booking.workshop.title}</h3>
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <svg className="mr-1" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3M16 7V3M4 11h16M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/></svg>
            {new Date(booking.workshop.date).toLocaleString()}
          </div>
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <svg className="mr-1" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 12.414a8 8 0 1 0-1.414 1.414l4.243 4.243a1 1 0 0 0 1.414-1.414z"/></svg>
            {booking.workshop.description}
          </div>
          <div className="bg-gray-100 rounded p-4 mb-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <div className="text-xs text-gray-500">Booking ID</div>
                <div className="font-mono text-sm">{booking.bookingCode}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Attendee Name</div>
                <div className="text-sm">{booking.attendeeName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Attendee Email</div>
                <div className="text-sm">{booking.attendeeEmail}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Number of Attendees</div>
                <div className="text-sm">{booking.numAttendees}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Workshop Price</div>
                <div className="text-sm">${booking.workshop.price}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Time Slot</div>
                <div className="text-sm">{booking.timeSlot.startTime} - {booking.timeSlot.endTime}</div>
              </div>
            </div>
          </div>
          <p className="text-gray-600 mb-2 text-sm">An email with your booking details and a calendar invitation has been sent to your registered email address. Please check your inbox and spam folder.</p>
          <p className="text-blue-700 font-semibold mb-4">We look forward to seeing you there!</p>
          <div className="flex gap-2">
            <button onClick={() => navigate("/")} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Back to Workshops</button>
            {localStorage.getItem("token") ? (
              <button onClick={() => navigate("/my-bookings")} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">View All My Bookings</button>
            ) : (
              <button disabled className="px-4 py-2 bg-gray-200 text-gray-700 rounded cursor-not-allowed">View All My Bookings</button>
            )}
          </div>
        </div>
        {/* Sidebar */}
        <aside className="w-full lg:w-80 bg-white rounded-xl shadow p-6 h-fit">
          <h4 className="font-semibold mb-4">What's Next?</h4>
          <ul className="space-y-4 mb-6">
            <li className="flex items-center gap-3 cursor-pointer" onClick={handleAddToCalendar}>
              <span className="text-blue-600">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </span>
              <span>Add to Calendar</span>
            </li>
            <li className="flex items-center gap-3 cursor-pointer" onClick={handleDownloadTicket}>
              <span className="text-pink-600">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 2 21l1.5-5L16.5 3.5z"/></svg>
              </span>
              <span>Download Your Ticket</span>
            </li>
          </ul>
          <img src="/4.png" alt="Sidebar" className="rounded-lg w-full h-28 object-cover" />
        </aside>
      </div>
    </div>
  );
};

export default BookingConfirmed; 