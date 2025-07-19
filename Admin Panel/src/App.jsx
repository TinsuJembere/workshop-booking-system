import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Workshops from "./pages/Workshops";
import TimeSlots from "./pages/TimeSlots";
import Bookings from "./pages/Bookings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Layout from "./components/Layout";
import { AuthProvider, AuthContext } from "./utils/AuthContext";

// PrivateRoute wrapper
function PrivateRoute() {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// Redirect to dashboard if already logged in
function PublicRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workshops" element={<Workshops />} />
              <Route path="/timeslots" element={<TimeSlots />} />
              <Route path="/bookings" element={<Bookings />} />
            </Route>
          </Route>
          {/* Redirect / to /dashboard if authenticated, else to /login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Catch-all: redirect to login if not authenticated, else dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 