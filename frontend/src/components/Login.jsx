import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, User, Lock } from 'lucide-react';

export default function Login({ setUser }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", form);
      localStorage.setItem('user', res.data.username);
      setUser(res.data.username);
      navigate('/');
    } catch (err) {
      alert("Invalid credentials or account not verified.");
    }
  };

  return (
    <div className="min-h-screen bg-[#7d86d5] flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-10">
          
          <h1 className="text-4xl font-black text-[#2c3e50] italic tracking-tighter">TASKER PRO</h1>
          <p className="text-[#7d86d5] font-black uppercase text-[10px] tracking-[0.2em] mt-2">Make your Task easy.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-[#7d86d5] transition-all text-sm font-medium" placeholder="Username" onChange={e => setForm({...form, username: e.target.value})} required />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-[#7d86d5] transition-all text-sm font-medium" type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button className="w-full bg-[#7d86d5] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#2c3e50] transition-all shadow-xl shadow-[#7d86d5]/30">
            Sign In
          </button>
        </form>

        <p className="text-center mt-8 text-[11px] font-black text-slate-400 uppercase tracking-wider">
          New here? <Link to="/signup" className="text-[#7d86d5] ml-1 hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}