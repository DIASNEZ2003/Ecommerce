import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, Clock, CheckCircle2, LogOut, 
  Trash2, Plus, X, Edit3, Save, Sun, MapPin, CheckCircle
} from 'lucide-react';

const API = "http://127.0.0.1:8000/api/tasks";

export default function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [modal, setModal] = useState({ show: false, type: '', data: null });
  const [showSuccess, setShowSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().split(' ')[0].slice(0, 5);
  const [form, setForm] = useState({ title: '', date: today, time: now });
  const [isEditing, setIsEditing] = useState(null);

  // --- LIVE REAL-TIME ENGINE ---
  useEffect(() => {
    fetchTasks();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API}/${user}/`);
      setTasks(res.data);
    } catch (e) { console.error("Fetch Error"); }
  };

  const getTimeRemaining = (date, time) => {
    const target = new Date(`${date}T${time}`);
    const diff = target - currentTime;
    if (diff <= 0) return "Overdue";
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return `${d > 0 ? d + 'd ' : ''}${h > 0 ? h + 'h ' : ''}${m}m ${s}s remaining`;
  };

  const confirmAction = async () => {
    const { type, data } = modal;
    try {
      if (type === 'delete') { await axios.delete(`${API}/detail/${data}/`); }
      else if (type === 'add') { await axios.post(`${API}/${user}/`, form); }
      else if (type === 'edit') { await axios.put(`${API}/detail/${isEditing}/`, form); setIsEditing(null); }
      else if (type === 'complete_task') { await axios.put(`${API}/detail/${data}/`, { is_done: true }); }
      else if (type === 'logout') { onLogout(); }
      
      setForm({ title: '', date: today, time: now });
      fetchTasks();
      setModal({ show: false, type: '', data: null });
      if (type !== 'logout') { setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2000); }
    } catch (e) { console.error("Action Error"); }
  };

  const pendingTasks = tasks.filter(t => !t.is_done && new Date(`${t.date}T${t.time}`) >= currentTime);
  const completedTasks = tasks.filter(t => t.is_done);
  const incompleteTasks = tasks.filter(t => !t.is_done && new Date(`${t.date}T${t.time}`) < currentTime);
  const displayTasks = activeTab === 'complete' ? completedTasks : activeTab === 'incomplete' ? incompleteTasks : pendingTasks;

  return (
    <div className="flex h-screen bg-[#f0f2f9] font-sans text-slate-700 overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-[#7d86d5] text-white flex flex-col shadow-xl h-full fixed z-50">
        <div className="p-8 text-2xl font-black italic tracking-tighter uppercase border-b border-white/10 mb-4">Tasker Pro</div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveTab('pending')} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === 'pending' ? 'bg-yellow-500 shadow-lg' : 'hover:bg-white/10'}`}>
            <LayoutDashboard size={18} /> <span className="font-bold uppercase text-[10px] tracking-widest">Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('complete')} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === 'complete' ? 'bg-green-500 shadow-lg' : 'hover:bg-white/10'}`}>
            <CheckCircle2 size={18} /> <span className="font-bold uppercase text-[10px] tracking-widest">Complete</span>
          </button>
          <button onClick={() => setActiveTab('incomplete')} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === 'incomplete' ? 'bg-red-500 shadow-lg' : 'hover:bg-white/10'}`}>
            <Clock size={18} /> <span className="font-bold uppercase text-[10px] tracking-widest">Incomplete</span>
          </button>
        </nav>
        <button onClick={() => setModal({ show: true, type: 'logout' })} className="p-6 flex items-center gap-3 hover:bg-red-500 uppercase font-black text-[10px] tracking-widest border-t border-white/10">
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        {/* FIXED HEADER STATS */}
        <header className="bg-[#b4bbf2] h-20 flex justify-between items-center px-10 shadow-md shrink-0">
          <div className="flex gap-4 font-black text-[9px] tracking-widest uppercase text-[#2c3e50]">
            <div className="bg-yellow-400 text-white px-3 py-1 rounded shadow-sm">Pending: {pendingTasks.length}</div>
            <div className="bg-green-500 text-white px-3 py-1 rounded shadow-sm">Done: {completedTasks.length}</div>
            <div className="bg-red-500 text-white px-3 py-1 rounded shadow-sm">Incomplete: {incompleteTasks.length}</div>
          </div>
          <div className="font-bold text-[#2c3e50] uppercase text-xs flex items-center gap-2">
            {user} <div className="w-8 h-8 bg-[#7d86d5] rounded-full border-2 border-white flex items-center justify-center text-white">{user.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        <main className="p-6 flex flex-col gap-6 h-full overflow-hidden">
          <div className="grid grid-cols-12 gap-6 shrink-0">
            {/* INPUT FORM */}
            <div className={`col-span-8 bg-white p-5 rounded-lg shadow-sm border-t-4 ${isEditing ? 'border-orange-400' : 'border-[#00cfd5]'}`}>
              <form onSubmit={(e) => { e.preventDefault(); setModal({ show: true, type: isEditing ? 'edit' : 'add' }); }} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Task Title</label>
                  <input className="w-full border-b p-2 outline-none text-[11px]" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <input type="date" className="border-b p-2 text-[11px] outline-none" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                <input type="time" className="border-b p-2 text-[11px] outline-none" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
                <button type="submit" className={`p-2.5 px-6 rounded-lg text-white font-black uppercase text-[9px] flex items-center gap-2 ${isEditing ? 'bg-orange-400' : 'bg-[#7d86d5]'}`}>
                  {isEditing ? <Save size={14}/> : <Plus size={14}/>} {isEditing ? 'Save' : 'Add'}
                </button>
              </form>
            </div>

            {/* LIVE CLOCK & WEATHER (Right Side) */}
            <div className="col-span-4 bg-[#c2c9ff] flex flex-col items-center justify-center p-4 text-white rounded-lg shadow-sm">
                <h2 className="text-4xl font-light tracking-tighter leading-none tabular-nums">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </h2>
                <div className="mt-2 flex items-center gap-2 text-yellow-200">
                    <Sun size={18} />
                    <span className="text-2xl font-light text-white">30°C</span>
                </div>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-widest opacity-70 flex items-center gap-1"><MapPin size={10} /> Bacolod PH</p>
            </div>
          </div>

          {/* SCROLLABLE TASK LIST */}
          <div className="bg-white p-6 rounded-lg shadow-sm flex-1 overflow-hidden flex flex-col">
            <h2 className="text-[#2c3e50] font-black uppercase text-sm mb-4 tracking-tight shrink-0">{activeTab} View</h2>
            <div className="overflow-y-auto flex-1 pr-2">
              <div className="space-y-3">
                {displayTasks.map(t => (
                  <div key={t.id} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border-l-4" style={{ borderLeftColor: t.is_done ? '#22c55e' : (activeTab === 'incomplete' ? '#ef4444' : '#eab308') }}>
                    <div className="flex-1">
                      {/* FIXED: Removed 'line-through' here */}
                      <h4 className={`font-bold text-[11px] uppercase tracking-wide ${t.is_done ? 'text-black' : 'text-[#2c3e50]'}`}>{t.title}</h4>
                      <div className="flex gap-4 mt-1 items-center">
                          <p className="text-[9px] text-slate-400 font-bold italic uppercase">{t.date} | {t.time}</p>
                          {activeTab === 'pending' && (
                              <p className="text-[10px] text-orange-500 font-black uppercase tracking-tighter bg-orange-50 px-2 py-0.5 rounded shadow-sm border border-orange-100 tabular-nums">
                                  ⏱ {getTimeRemaining(t.date, t.time)}
                              </p>
                          )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {activeTab === 'pending' && (
                        <>
                          <button onClick={() => setModal({ show: true, type: 'complete_task', data: t.id })} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm">
                            <CheckCircle size={14}/>
                          </button>
                          <button onClick={() => { setIsEditing(t.id); setForm({title: t.title, date: t.date, time: t.time}); }} className="p-2 text-slate-300 hover:text-orange-400 transition-colors"><Edit3 size={15}/></button>
                        </>
                      )}
                      <button onClick={() => setModal({ show: true, type: 'delete', data: t.id })} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={15}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* --- PURPLE MODAL --- */}
      {modal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2c3e50]/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#7d86d5] p-8 text-center text-white font-black text-2xl uppercase tracking-tighter">? Confirm</div>
            <div className="p-8 text-center">
              <p className="text-slate-500 font-medium mb-8 text-sm italic">
                {modal.type === 'logout' && "Are you sure you want to sign out?"}
                {modal.type === 'delete' && "This will remove the task permanently."}
                {modal.type === 'edit' && "Save changes to this task?"}
                {modal.type === 'add' && "Add this new task?"}
                {modal.type === 'complete_task' && "Mark this task as completed?"}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setModal({ show: false, type: '', data: null })} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-slate-400 uppercase text-[10px]">Cancel</button>
                <button onClick={confirmAction} className={`flex-1 py-4 rounded-2xl font-black text-white uppercase text-[10px] ${modal.type === 'delete' ? 'bg-red-500' : (modal.type === 'complete_task' ? 'bg-green-500' : 'bg-[#7d86d5]')}`}>Yes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS TOAST */}
      {showSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] bg-[#2c3e50] text-white px-6 py-3 rounded-full font-black uppercase text-[9px] tracking-[0.2em] shadow-2xl">
           Action Successful
        </div>
      )}
    </div>
  );
}