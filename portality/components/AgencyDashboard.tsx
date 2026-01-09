import React, { useEffect, useState } from 'react';
import { notionService } from '../services/notionService';
import { Client, Task } from '../types';
import { 
  User, Briefcase, CheckSquare, 
  Clock, Calendar, Zap, LayoutGrid, Database, 
  LogOut, Target, Mic, Plus
} from 'lucide-react';

interface AgencyDashboardProps {
  user: any;
  tasks: Task[];
  clients: Client[];
  onNavigate: (view: any) => void;
}

export const AgencyDashboard: React.FC<AgencyDashboardProps> = ({ user, tasks, clients, onNavigate }) => {
  const [team, setTeam] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const loadRealData = async () => {
      setIsSyncing(true);
      try {
        const tm = await notionService.getTeam();
        setTeam(tm);
      } catch (e) {
        console.error("Failed to load team", e);
      }
      setTimeout(() => setIsSyncing(false), 800);
    };
    loadRealData();
  }, []);

  return (
    <div className="min-h-screen bg-[#020204] text-gray-400 p-4 lg:p-8 font-sans selection:bg-emerald-500/30">
      
      {/* 1. TOP NAVIGATION / HEADER */}
      <header className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <span className="text-[10px] font-black tracking-[0.3em] text-gray-600 uppercase">Bienvenido</span>
          <h2 className="text-2xl font-bold text-white tracking-tight">{user.name}</h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">PolimataOS Online</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('home')}
            className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group"
          >
            <LayoutGrid size={20} className="group-hover:text-white transition-colors" />
          </button>
          <button className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 hover:bg-red-500/20 transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-32">
        
        {/* LEFT COLUMN: MAIN BENTO SYSTEM (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* A. ECOSYSTEM STATUS CARD */}
          <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0c] to-[#050505] border border-white/5 rounded-[2.5rem] p-8 group">
            {/* Background Decorative Blur */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
            
            <div className="relative z-10 flex justify-between items-start mb-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <Database size={24} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Ecosistema Elevat</h3>
                  <p className="text-sm text-gray-500">Sincronización Neural</p>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full border transition-all flex items-center gap-2 ${isSyncing ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                <Zap size={12} className={isSyncing ? 'text-amber-500 animate-spin' : 'text-emerald-500'} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${isSyncing ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {isSyncing ? 'Syncing...' : 'Online'}
                </span>
              </div>
            </div>

            {/* Grid of Inner Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              {[
                { label: 'Hub Operativo', icon: <Target size={18} />, status: 'Online', view: 'home' },
                { label: 'Clientes 2026', icon: <User size={18} />, status: `${clients.length} Activos`, view: 'agency' },
                { label: 'Tareas Ops', icon: <CheckSquare size={18} />, status: `${tasks.length} Pendientes`, view: 'board' },
                { label: 'Equipo', icon: <Database size={18} />, status: team.map(t => t.name.split(' ')[0]).join(' & ') || 'Cargando...', view: 'agency' }
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => onNavigate(item.view)}
                  className="w-full text-left bg-white/[0.03] border border-white/5 rounded-3xl p-5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer group/tile overflow-hidden relative active:scale-95"
                >
                  <div className="mb-4 text-gray-500 group-hover/tile:text-emerald-400 transition-colors">{item.icon}</div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-gray-300 tracking-tight group-hover:text-white transition-colors">{item.label}</div>
                    <div className="text-[10px] text-gray-600 uppercase tracking-widest">{item.status}</div>
                  </div>
                  {/* Subtle hover indicator */}
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/10 group-hover/tile:bg-emerald-500 transition-all"></div>
                </button>
              ))}
            </div>

            {/* Radar Decoration */}
            <div className="absolute right-8 bottom-8 opacity-20 hidden md:block group-hover:opacity-40 transition-opacity">
               <svg width="120" height="120" viewBox="0 0 100 100" fill="none" className="animate-spin-slow">
                 <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                 <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                 <path d="M50 2 L50 50 L98 50" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
               </svg>
            </div>
          </section>

          {/* B. LOWER STRATEGIC SECTION (RAG/DOCS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Portality Intelligence Card */}
             <div className="bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-8">
                <div className="flex justify-between items-center mb-6">
                   <h4 className="text-lg font-bold text-white tracking-tight">Portality Intelligence</h4>
                   <div className="flex gap-2">
                      <button className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-emerald-500/20 transition-all flex items-center gap-1">
                        <Zap size={10} /> Vectorizar
                      </button>
                      <button className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest rounded-full tracking-widest">RAG</button>
                   </div>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-all">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Database size={16} /></div>
                      <div>
                         <div className="text-sm font-medium text-white">Supabase Database</div>
                         <div className="text-xs text-gray-600">Sync Global Activa</div>
                      </div>
                   </div>
                   <div className="w-8 h-4 bg-emerald-500/20 rounded-full relative">
                      <div className="absolute right-1 top-1 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_6px_#10b981]"></div>
                   </div>
                </div>
             </div>

             {/* Agora Integration Card */}
             <div className="bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center border-dashed group cursor-pointer hover:bg-white/[0.02] transition-all">
                <div className="text-center space-y-3">
                   <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-gray-600 group-hover:text-white transition-colors">
                      <Plus size={24} />
                   </div>
                   <div className="text-sm font-bold text-gray-500 group-hover:text-gray-300">Conectar Agora Core</div>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PORTFOLIO & CHRONOS (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* C. CLIENT PORTFOLIO (CARTERA) */}
          <section className="bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-6">
            <div className="flex justify-between items-center mb-6 px-2">
               <div className="flex items-center gap-2">
                  <Briefcase size={18} className="text-blue-500" />
                  <h3 className="text-lg font-bold text-white tracking-tight">Cartera 2026</h3>
               </div>
               <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full uppercase tracking-widest">4 Activos</span>
            </div>

            <div className="space-y-3">
              {clients.map((client) => (
                <div key={client.id} className="group bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.05] transition-all cursor-pointer flex justify-between items-center relative overflow-hidden">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-tr from-white/5 to-white/10 border border-white/10 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-blue-400 transition-colors">
                         {client.name.includes('Clínica') ? <LayoutGrid size={18} /> : 
                          client.name.includes('Sign') ? <LayoutGrid size={18} /> : 
                          <Database size={18} />}
                      </div>
                      <div>
                         <div className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{client.name}</div>
                         <div className="text-[10px] text-gray-600 uppercase tracking-widest">{client.type === 'fixed' ? 'Retainer' : 'Onboarding'}</div>
                      </div>
                   </div>
                   <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${
                      client.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                   }`}>
                      {client.status === 'active' ? 'Active' : 'Lead'}
                   </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-6">
               <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">Ver Todos</button>
               <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 border border-blue-400/30 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2">
                 <Plus size={14} /> Nuevo
               </button>
            </div>
          </section>

          {/* D. CHRONOS (CALENDAR) */}
          <section className="bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-6 lg:h-[400px] flex flex-col">
             <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex items-center gap-2 text-gray-400">
                   <Calendar size={18} />
                   <h3 className="text-lg font-bold tracking-tight text-white">Chronos</h3>
                </div>
                <button className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Agenda Real</button>
             </div>
             
             {/* Empty State placeholder for Chronos */}
             <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-full flex items-center justify-center text-gray-700">
                  <Clock size={32} />
                </div>
                <div className="space-y-1">
                   <div className="text-sm font-bold text-gray-400">Sin eventos próximos</div>
                   <div className="text-[10px] text-gray-600 uppercase tracking-widest">Sincroniza con Notion Calendar</div>
                </div>
             </div>
          </section>
        </div>
      </div>

      {/* 4. FLOATING COMMAND BAR (AUREON) */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-[100]">
         <div className="bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <div className="flex-1 flex justify-evenly items-center pr-10">
               {[
                 { label: 'Agencia', icon: <LayoutGrid size={20} /> },
                 { label: 'Data', icon: <Database size={20} /> }
               ].map((item, i) => (
                 <button key={i} className="flex flex-col items-center gap-1 group">
                   <div className="p-2 text-gray-600 group-hover:text-emerald-500 transition-all">{item.icon}</div>
                   <span className="text-[8px] font-black uppercase tracking-widest text-gray-600 group-hover:text-emerald-500">{item.label}</span>
                 </button>
               ))}
            </div>

            {/* Central Voice Pulse (Simulation) */}
            <div className="relative -top-8">
               <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse scale-150"></div>
               <button className="relative w-16 h-16 bg-black border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4),inset_0_2px_10px_rgba(255,255,255,0.1)] group">
                  <div className="absolute inset-0 rounded-full border border-emerald-500/50 scale-110 group-hover:scale-125 transition-transform duration-500"></div>
                  <Mic size={24} />
               </button>
               <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-emerald-500 uppercase tracking-[0.4em]">Aureon</div>
            </div>

            <div className="flex-1 flex justify-evenly items-center pl-10">
               {[
                 { label: 'RAG', icon: <Database size={20} /> },
                 { label: 'Chat', icon: <Zap size={20} /> }
               ].map((item, i) => (
                 <button key={i} className="flex flex-col items-center gap-1 group">
                   <div className="p-2 text-gray-600 group-hover:text-blue-500 transition-all">{item.icon}</div>
                   <span className="text-[8px] font-black uppercase tracking-widest text-gray-600 group-hover:text-blue-500">{item.label}</span>
                 </button>
               ))}
            </div>
         </div>
      </footer>
    </div>
  );
};
