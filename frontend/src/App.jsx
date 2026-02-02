import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import our new components
import Login from './components/Login';
import Signup from './components/Signup';
import Activate from './components/Activate';
import Dashboard from './components/Dashboard';

// Small component for the verification link logic
const Verify = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
  axios.get('/api/verify/${token}/').then(() => navigate('/login'));
  }, [token]);
  return <div className="min-h-screen flex items-center justify-center">Activating...</div>;
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
        {/* If logged in, show Dashboard. If not, show Login */}
        <Route path="/" element={user ? <Dashboard user={user} onLogout={logout} /> : <Login setUser={setUser} />} />
        
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/activate" element={<Activate />} />
        <Route path="/verify/:token" element={<Verify />} />
      </Routes>
    </BrowserRouter>
  );
}