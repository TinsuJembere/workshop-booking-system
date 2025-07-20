import React from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const Footer = () => {
  const [email, setEmail] = useState("");
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      window.alert("Please enter a valid email address.");
      return;
    }
    try {
      await axios.post("https://workshop-booking-system-1.onrender.com/api/auth/subscribe", { email });
      window.alert("Subscribed successfully! You'll receive updates in your inbox.");
      setEmail("");
    } catch (err) {
      const msg = err.response?.data?.error;
      if (msg === "Email already subscribed") {
        window.alert("This email is already subscribed.");
      } else {
        window.alert(msg || "Subscription failed. Try again later.");
      }
    }
  };
  return (
    <footer className="bg-white border-t border-gray-200 mt-12 pt-10 pb-4">
      <div className="container mx-auto flex flex-col items-center">
        {/* Section Title */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Workshop Bookings</h2>
        {/* Newsletter Subscription */}
        <p className="text-gray-600 mb-4">Stay updated with our latest workshops!</p>
        <form className="flex flex-col sm:flex-row items-center w-full max-w-md mb-6" onSubmit={handleSubscribe}>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full sm:w-auto flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="mt-2 sm:mt-0 sm:ml-2 px-6 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition font-semibold"
          >
            Subscribe
          </button>
        </form>
        {/* Copyright */}
        <div className="text-gray-500 text-sm text-center">
          &copy; {new Date().getFullYear()} Workshop Bookings. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer; 