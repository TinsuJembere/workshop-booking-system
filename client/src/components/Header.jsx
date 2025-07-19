import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const getUserFromStorage = () => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) return JSON.parse(user);
    return null;
  } catch {
    return null;
  }
};

const Header = () => {
  const [user, setUser] = useState(getUserFromStorage());
  const [dropdown, setDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorage = () => setUser(getUserFromStorage());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setDropdown(false);
    navigate("/");
  };

  // Listen for login/signup to update user state
  useEffect(() => {
    const checkUser = () => setUser(getUserFromStorage());
    window.addEventListener("auth", checkUser);
    return () => window.removeEventListener("auth", checkUser);
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className="font-bold text-xl text-indigo-600">Workshop Bookings</span>
        </div>
        {/* Navigation */}
        <nav className="flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium">Workshops</Link>
          {user ? (
            <div className="relative">
              <button
                className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg focus:outline-none"
                onClick={() => setDropdown((d) => !d)}
                title={user.name}
              >
                {user.name ? user.name[0].toUpperCase() : "U"}
              </button>
              {dropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="text-indigo-600 border border-indigo-600 px-4 py-1 rounded hover:bg-indigo-50 font-medium transition">Login/Register</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 