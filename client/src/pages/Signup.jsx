import React, { useState } from "react";
import AuthCard from "../components/AuthCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("https://workshop-booking-system-1.onrender.com/api/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("auth"));
      setLoading(false);
      navigate("/");
    } catch (err) {
      setLoading(false);
      let msg = "Signup failed. Please check your details.";
      if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* Left Side */}
        <div className="md:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-blue-600 to-indigo-500">
          <AuthCard
            title="Join Us!"
            description="Create an account to book workshops and unlock your creative journey."
            image="/2.png"
          />
        </div>
        {/* Right Side */}
        <div className="md:w-1/2 w-full p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-500 mb-6">Sign up to get started</p>
          {error && <div className="mb-4 text-red-600 text-sm font-medium">{error}</div>}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your name"
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter password"
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
          <div className="flex justify-between items-center mt-4 text-sm">
            <span className="text-gray-500">Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup; 