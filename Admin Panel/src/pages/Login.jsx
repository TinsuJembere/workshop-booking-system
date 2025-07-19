import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const success = await login(email, password);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden flex-col md:flex-row">
      {/* Left Panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-500 p-8 md:p-12 w-full md:w-1/2">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center mb-8 w-full max-w-md">
          <img src="/vite.svg" alt="avatar" className="w-16 h-16 rounded-full mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Login to book your favorite workshops and manage your bookings.</p>
        </div>
        <h2 className="text-white font-bold text-2xl mb-2">Speedy, Easy and Faster</h2>
        <p className="text-indigo-100 max-w-md text-center">
          Discover and book hands-on workshops to learn new skills, connect with experts, and unleash your creativity. Join our community and start your learning journey today!
        </p>
      </div>
      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-8 md:p-12 w-full md:w-1/2">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl p-8 shadow-lg">
          <h2 className="font-bold text-2xl mb-2">Login Account</h2>
          <p className="text-gray-500 mb-6">Send, spend and save smarter</p>
          <label className="block mb-2 font-medium">Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <label className="block mb-2 font-medium">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter password" className="w-full p-3 mb-6 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg mb-4 transition">Login</button>
          <div className="flex flex-col md:flex-row justify-between text-sm gap-2 md:gap-0">
            <span>Forgot password? <a href="#" className="text-blue-600 hover:underline">Click here</a></span>
            <span>Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link></span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 