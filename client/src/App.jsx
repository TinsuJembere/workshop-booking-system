import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import WorkshopGrid from "./components/WorkshopGrid";
import Pagination from "./components/Pagination";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BookingConfirmed from "./pages/BookingConfirmed";
import MyBookings from "./pages/MyBookings";
import axios from "axios";
import './App.css';

function useResponsiveLimit() {
  const [limit, setLimit] = useState(window.innerWidth < 768 ? 4 : 8);
  useEffect(() => {
    const handleResize = () => {
      setLimit(window.innerWidth < 768 ? 4 : 8);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return limit;
}

function AppContent() {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === "/login" || location.pathname === "/signup";

  // Filtering and pagination state
  const [filters, setFilters] = useState({ search: "", category: "" });
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = useResponsiveLimit();

  const fetchWorkshops = useCallback(async (filters, page, limit) => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      const res = await axios.get("https://workshop-booking-system-1.onrender.com/api/workshops", { params });
      setWorkshops(res.data.workshops);
      setTotal(res.data.total);
    } catch (err) {
      setError("Failed to load workshops.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkshops(filters, page, limit);
  }, [fetchWorkshops, filters, page, limit]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!hideHeaderFooter && <Header />}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroSection onFilterChange={handleFilterChange} />
              <main className="flex-1 container mx-auto px-4 py-8">
                {loading ? (
                  <div className="text-center text-gray-500 py-12">Loading workshops...</div>
                ) : error ? (
                  <div className="text-center text-red-500 py-12">{error}</div>
                ) : (
                  <WorkshopGrid workshops={workshops} />
                )}
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </main>
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/booking-confirmed" element={<BookingConfirmed />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
