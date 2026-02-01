import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Sparkles } from 'lucide-react';

const API = "http://127.0.0.1:8000/api";

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/register/`, form);
      navigate('/activate');
    } catch (err) {
      alert("Registration failed. Username might be taken.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fff1f2] flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 md:p-14 rounded-[50px] shadow-2xl w-full max-w-md border border-pink-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Sparkles size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
            JOIN <span className="text-pink-600">US</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-3">Start your journey</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-pink-600 transition-colors" size={18} />
            <input className="w-full pl-14 pr-6 py-5 bg-pink-50/30 rounded-[24px] border-none outline-none focus:ring-2 ring-pink-100 transition-all text-sm font-bold text-slate-800 placeholder:text-slate-300" placeholder="Create Username" onChange={e => setForm({...form, username: e.target.value})} required />
          </div>

          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-pink-600 transition-colors" size={18} />
            <input className="w-full pl-14 pr-6 py-5 bg-pink-50/30 rounded-[24px] border-none outline-none focus:ring-2 ring-pink-100 transition-all text-sm font-bold text-slate-800 placeholder:text-slate-300" type="email" placeholder="Email Address" onChange={e => setForm({...form, email: e.target.value})} required />
          </div>

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-pink-600 transition-colors" size={18} />
            <input className="w-full pl-14 pr-6 py-5 bg-pink-50/30 rounded-[24px] border-none outline-none focus:ring-2 ring-pink-100 transition-all text-sm font-bold text-slate-800 placeholder:text-slate-300" type="password" placeholder="Create Password" onChange={e => setForm({...form, password: e.target.value})} required />
          </div>

          <button className="w-full bg-pink-600 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-pink-100 active:scale-95">
            Create Account
          </button>
        </form>

        <p className="text-center mt-10 text-[10px] font-black text-slate-300 uppercase tracking-widest">
          Already a member? <Link to="/login" className="text-pink-500 ml-1 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}