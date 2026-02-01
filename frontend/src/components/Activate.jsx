import React from 'react';
import { Link } from 'react-router-dom';
import { MailOpen } from 'lucide-react';

export default function Activate() {
  return (
    <div className="min-h-screen bg-[#7d86d5] flex items-center justify-center p-6 font-sans text-center">
      <div className="bg-white p-12 rounded-[40px] shadow-2xl max-w-md w-full border border-white/20">
        <div className="w-24 h-24 bg-[#c2c9ff] text-[#7d86d5] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border-4 border-white">
          <MailOpen size={48} />
        </div>
        <h2 className="text-3xl font-black text-[#2c3e50] italic tracking-tighter mb-4 uppercase">Check Inbox</h2>
        <p className="text-slate-400 mb-10 text-[10px] font-black uppercase tracking-widest leading-loose">
          A verification link has been sent. <br/> Please check your Gmail to activate.
        </p>
        
        <button 
          onClick={() => window.open('https://mail.google.com', '_blank')}
          className="w-full bg-[#7d86d5] text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#2c3e50] transition-all shadow-xl shadow-[#7d86d5]/30"
        >
          Open Gmail
        </button>

        <Link to="/login" className="block mt-8 text-[10px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest transition-colors">
          Return to Login
        </Link>
      </div>
    </div>
  );
}