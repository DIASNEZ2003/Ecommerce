import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const API = "https://hexshop-xi.vercel.app/api";

export default function Login({ setUser }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/login/`, form);
      localStorage.setItem('user', res.data.username);
      setUser(res.data.username);
      navigate('/');
    } catch (err) {
      alert("Invalid credentials or account not verified.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fff1f2] flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 md:p-14 rounded-[50px] shadow-2xl w-full max-w-md border border-pink-100 relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-50 rounded-full opacity-50" />
        
        <div className="text-center mb-10 relative z-10">
          <div className="w-16 h-16 bg-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-200 rotate-3">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
            HEX<span className="text-pink-600">SHOP</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-3">Welcome Back</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div className="group transition-all">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block tracking-widest">Identify</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-pink-600 transition-colors" size={18} />
              <input 
                className="w-full pl-14 pr-6 py-5 bg-pink-50/30 rounded-[24px] border-2 border-transparent outline-none focus:border-pink-200 focus:bg-white transition-all text-sm font-bold text-slate-800 placeholder:text-slate-300" 
                placeholder="Username" 
                onChange={e => setForm({...form, username: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div className="group transition-all">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block tracking-widest">Security</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-pink-600 transition-colors" size={18} />
              <input 
                className="w-full pl-14 pr-6 py-5 bg-pink-50/30 rounded-[24px] border-2 border-transparent outline-none focus:border-pink-200 focus:bg-white transition-all text-sm font-bold text-slate-800 placeholder:text-slate-300" 
                type="password" 
                placeholder="••••••••" 
                onChange={e => setForm({...form, password: e.target.value})} 
                required 
              />
            </div>
          </div>

          <button className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] hover:bg-pink-600 transition-all shadow-2xl shadow-pink-100 flex items-center justify-center gap-3 mt-4 active:scale-95">
            Sign In <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center mt-10">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            New here? <Link to="/signup" className="text-pink-500 ml-1 hover:text-pink-700 transition-colors underline decoration-2 underline-offset-4">Join HexShop</Link>
          </p>
        </div>
      </div>
    </div>
  );
}