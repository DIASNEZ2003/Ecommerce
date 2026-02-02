import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import our new components
import Login from './components/Login';
import Signup from './components/Signup';
import Activate from './components/Activate';
import Dashboard from './components/Dashboard';

// Use your LIVE Vercel Backend Domain here
const API_BASE_URL = "https://your-backend-project.vercel.app/api";

const Verify = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // FIX: Use backticks `` for template literals and the full API URL
    axios.get(`${API_BASE_URL}/verify/${token}/`)
      .then(() => {
        alert("Account activated! You can now log in.");
        navigate('/login');
      })
      .catch(() => {
        alert("Activation link invalid or expired.");
        navigate('/login');
      });
  }, [token, navigate]);

  return <div className="min-h-screen flex items-center justify-center">Activating your account...</div>;
};

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('user'));

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Dashboard user={user} onLogout={logout} /> : <Login setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/activate" element={<Activate />} />
        <Route path="/verify/:token" element={<Verify />} />
      </Routes>
    </BrowserRouter>
  );
}