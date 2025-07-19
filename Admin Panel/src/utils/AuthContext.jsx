import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    const userData = localStorage.getItem("admin-user");
    setIsAuthenticated(!!token);
    setUser(userData ? JSON.parse(userData) : null);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("admin-token", data.token);
        localStorage.setItem("admin-user", JSON.stringify(data.user));
        setIsAuthenticated(true);
        setUser(data.user);
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("admin-token", data.token);
        localStorage.setItem("admin-user", JSON.stringify(data.user));
        setIsAuthenticated(true);
        setUser(data.user);
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("admin-token");
    localStorage.removeItem("admin-user");
    setIsAuthenticated(false);
    setUser(null);
  };

  // Helper to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem("admin-token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  );
}; 