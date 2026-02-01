import React from 'react';
import { Link } from 'react-router-dom';
import { MailOpen, CheckCircle2 } from 'lucide-react';

export default function Activate() {
  return (
    <div className="min-h-screen bg-[#fff1f2] flex items-center justify-center p-6 font-sans text-center">
      <div className="bg-white p-12 md:p-16 rounded-[60px] shadow-2xl max-w-md w-full border border-pink-100 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border border-pink-50">
           <div className="w-20 h-20 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center border-4 border-white">
              <MailOpen size={36} />
           </div>
        </div>

        <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter mb-4 uppercase mt-4">
          Check <span className="text-pink-600">Inbox</span>
        </h2>
        <p className="text-slate-400 mb-10 text-[11px] font-bold uppercase tracking-widest leading-loose px-4">
          We've sent a magic link. <br/> Please verify your Gmail to activate your HexShop profile.
        </p>
        
        <button 
          onClick={() => window.open('https://mail.google.com', '_blank')}
          className="w-full bg-slate-900 text-white py-5 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-pink-600 transition-all shadow-2xl active:scale-95"
        >
          Open Gmail
        </button>

        <Link to="/login" className="group flex items-center justify-center gap-2 mt-10 text-[10px] font-black text-slate-300 hover:text-pink-500 uppercase tracking-widest transition-all">
          <CheckCircle2 size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          Ready to login
        </Link>
      </div>
    </div>
  );
}