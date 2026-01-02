import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, LayoutGrid, MessageSquareText, LogOut, FileChartColumn, Database, Cpu } from 'lucide-react';
import { supabase } from './lib/supabase';
import { ragService } from './services/ragService';
import LoginView from './components/LoginView';
import VoiceCore from './components/VoiceCore';
import { SettingsPanel } from './components/SettingsPanel';
import Dashboard from './components/Dashboard';
import KanbanView from './components/KanbanView';
import FlowView from './components/FlowView';
import ReportView from './components/ReportView';
import KnowledgeBaseView from './components/KnowledgeBaseView';
import TasksView from './components/TasksView';
import { Task, Lead, ViewState, AudioState, ChatMessage, UserProfile, NotionPage } from './types';
import { THEMES } from './constants';

const PROFILES: Record<string, UserProfile> = {
  andrea: { id: 'andrea', name: 'Andrea Chimaras', role: 'CEO (Strategic)', avatar: 'AC', theme: 'emerald' },
  christian: { id: 'christian', name: 'Christian Moreno', role: 'Ops Lead', avatar: 'CM', theme: 'emerald' },
  moises: { id: 'moises', name: 'Moisés D Vera', role: 'Tech Lead', avatar: 'MV', theme: 'emerald' },
};

const EMAIL_TO_PROFILE: Record<string, string> = {
    'andrea@elevat.io': 'andrea',
    'christian@elevat.io': 'christian',
    'moises@elevat.io': 'moises'
};

const USER_DATA_TASKS = {
  andrea: [
        { id: '1', title: 'Revisar flujo de caja Q2', priority: 'high', status: 'todo', completed: false, tags: ['Finanzas'], assignedTo: 'AC' },
        { id: '2', title: 'Aprobar copy web Elevat', priority: 'medium', status: 'review', completed: false, tags: ['Marketing'], assignedTo: 'AC' },
        { id: '10', title: 'Firmar acuerdo inversores', priority: 'high', status: 'in-progress', completed: false, tags: ['Legal'], assignedTo: 'AC' }
  ],
  christian: [
        { id: '3', title: 'Configurar automations Nux', priority: 'high', status: 'in-progress', completed: false, tags: ['Ops'], assignedTo: 'CM' },
        { id: '4', title: 'Onboarding nuevo cliente', priority: 'high', status: 'todo', completed: false, tags: ['Clientes'], assignedTo: 'CM' },
        { id: '11', title: 'Actualizar SOPs de ventas', priority: 'low', status: 'done', completed: true, tags: ['Docs'], assignedTo: 'CM' }
  ],
  moises: [
        { id: '6', title: 'Fix Webhook Latency', priority: 'high', status: 'in-progress', completed: false, tags: ['Dev'], assignedTo: 'MV' },
        { id: '7', title: 'Integrar RAG Vectorial', priority: 'medium', status: 'review', completed: false, tags: ['AI'], assignedTo: 'MV' },
        { id: '12', title: 'Desplegar v1.0 Production', priority: 'high', status: 'todo', completed: false, tags: ['Deploy'], assignedTo: 'MV' }
  ]
};

const GLOBAL_LEADS: Lead[] = [
  { id: '1', initials: 'EL', name: 'Elevat Latam', status: 'Hot', detail: 'Interesado en MVP', color: 'bg-gradient-to-br from-blue-500 to-purple-600' },
  { id: '2', initials: 'SA', name: 'Studio Alpha', status: 'New', detail: 'Agendó demo', color: 'bg-gray-200 dark:bg-gray-800 !text-gray-600 dark:!text-gray-300' },
  { id: '3', initials: 'NX', name: 'Nux Agency', status: 'Won', detail: 'Pago recibido', color: 'bg-lime-500 text-black' },
];

function App() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [demoAuthenticated, setDemoAuthenticated] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserProfile>(PROFILES.andrea);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<string>('dark');
  const [audioState, setAudioState] = useState<AudioState>(AudioState.IDLE);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [notionDocs, setNotionDocs] = useState<NotionPage[]>([]);
  const [leads] = useState<Lead[]>(GLOBAL_LEADS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Init Auth & Persistence
  useEffect(() => {
    // 1. Check LocalStorage for persistent demo session
    const persistedDemoUser = localStorage.getItem('polimata_demo_user');
    
    // 2. Check Supabase Session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session) {
            setSession(session);
            if (session?.user?.email) mapUserFromSession(session.user.email);
            setLoadingSession(false);
        } else if (persistedDemoUser) {
            // Auto-login demo user
            mapUserFromSession(persistedDemoUser);
            setDemoAuthenticated(true);
            setLoadingSession(false);
        } else {
            setLoadingSession(false);
        }
      })
      .catch((err) => {
        console.error("Supabase init error:", err);
        setLoadingSession(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.email) mapUserFromSession(session.user.email);
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapUserFromSession = (email: string) => {
      const profileKey = Object.keys(EMAIL_TO_PROFILE).find(key => email.includes(key.split('@')[0]));
      if (profileKey) {
          const pid = EMAIL_TO_PROFILE[profileKey];
          if (PROFILES[pid]) setCurrentUser(PROFILES[pid]);
      } else {
          setCurrentUser(PROFILES.andrea); 
      }
  };

  const handleDemoLogin = (email: string) => {
      // Persist login
      localStorage.setItem('polimata_demo_user', email);
      mapUserFromSession(email);
      setDemoAuthenticated(true);
  };

  const handleLogout = async () => { 
      // Clear all sessions
      await supabase.auth.signOut();
      localStorage.removeItem('polimata_demo_user');
      setDemoAuthenticated(false);
      setSession(null);
  };

  // Load User Data & RAG Context
  useEffect(() => {
    const userTasks = USER_DATA_TASKS[currentUser.id as keyof typeof USER_DATA_TASKS] || [];
    setTasks(userTasks as Task[]);

    const loadDocs = async () => {
        const docs = await ragService.getDashboardDocs(currentUser.id);
        setNotionDocs(docs);
    };
    loadDocs();

    setAccentColor(currentUser.theme);
    setMessages([
        { id: Date.now().toString(), role: 'assistant', content: `PolimataOS Online. Cargando Portality para: ${currentUser.name}.`, timestamp: new Date() }
    ]);
  }, [currentUser]);

  const handleAddTask = (title: string, priority: 'high' | 'medium' | 'low', status: Task['status'] = 'todo') => {
    const newTask: Task = { 
        id: Date.now().toString(), 
        title, 
        priority, 
        status, 
        completed: false, 
        tags: ['Inbox'],
        assignedTo: currentUser.avatar
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleUpdateTaskStatus = (id: string, newStatus: Task['status']) => {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, completed: newStatus === 'done' } : t));
  };
  
  const handleToggleTask = (id: string) => {
      setTasks(prev => prev.map(t => {
          if (t.id === id) {
              return { ...t, completed: !t.completed, status: !t.completed ? 'done' : 'todo' };
          }
          return t;
      }));
  };

  const handleDeleteTask = (id: string) => {
      setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleVoiceTaskCreate = async (title: string, priority: 'high' | 'medium' | 'low') => {
     handleAddTask(title, priority);
     setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: `✓ Tarea creada: ${title}`, timestamp: new Date() }]);
  };

  const [accentColor, setAccentColor] = useState<string>('emerald');

  useEffect(() => {
    const html = document.documentElement;
    if (themeMode === 'dark') html.classList.add('dark');
    else if (themeMode === 'light') html.classList.remove('dark');
    else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) html.classList.add('dark');
      else html.classList.remove('dark');
    }
  }, [themeMode]);

  useEffect(() => {
    const c = THEMES[accentColor];
    if (c) {
        const root = document.documentElement.style;
        root.setProperty('--primary', c.primary);
        root.setProperty('--primary-dim', c.primary + '33'); // Increased opacity for liquid feel
        root.setProperty('--secondary', c.secondary);
        root.setProperty('--secondary-dim', c.secondary + '33');
    }
  }, [accentColor]);

  if (loadingSession) return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Cpu className="animate-pulse" /></div>;
  if (!session && !demoAuthenticated) return <LoginView onLoginSuccess={handleDemoLogin} />;

  return (
    <div className="flex flex-col h-[100dvh] relative overflow-hidden font-sans text-gray-200 selection:bg-theme-primary/30">
        
        {/* 60% Dark Background + 15% Liquid Accent Blobs */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            {/* Deep Void Base */}
            <div className="absolute inset-0 bg-[#020204]"></div>
            
            {/* Liquid Blobs - Moving Organic Shapes */}
            <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob bg-theme-primary"></div>
            <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-blob animation-delay-2000 bg-theme-secondary"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[130px] opacity-10 animate-blob animation-delay-4000 bg-purple-900"></div>
            
            {/* Mesh Overlay for Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>

        {/* Global Header - Fixed with Backdrop Blur (Ghost Fix) */}
        <header className="fixed top-0 left-0 right-0 z-20 flex justify-between items-center px-6 pt-6 pb-4 bg-[#020204]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
            <div className="flex flex-col animate-in slide-in-from-top-4 duration-500">
                <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-0.5">Bienvenido</span>
                <h1 className="text-xl text-white font-bold tracking-tight">{currentUser.name}</h1>
            </div>
            <div className="flex gap-3">
                <button onClick={() => setIsSettingsOpen(true)} className="liquid-glass relative w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95">
                    <SlidersHorizontal size={18} strokeWidth={1.5} className="icon-duotone" />
                </button>
                <button onClick={handleLogout} className="liquid-glass relative w-10 h-10 rounded-full flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all active:scale-95">
                    <LogOut size={18} strokeWidth={1.5} className="icon-duotone" />
                </button>
            </div>
        </header>

        {/* Status Bar - Below Fixed Header */}
        <div className="mt-[88px] relative z-10 px-6 mb-6 animate-in slide-in-from-top-6 duration-700">
            <div className="flex items-center gap-3">
                <div className="liquid-glass flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md">
                    <div className={`w-1.5 h-1.5 rounded-full bg-theme-secondary ${audioState === AudioState.IDLE ? 'animate-pulse' : ''} shadow-[0_0_8px_var(--secondary)]`}></div>
                    <span className="text-[10px] font-bold tracking-wide text-gray-300 uppercase">
                        {audioState === AudioState.IDLE ? 'PolimataOS Online' : 'Voice Active'}
                    </span>
                </div>
            </div>
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar pb-[100px]">
             {currentView === 'home' && <Dashboard user={currentUser} tasks={tasks} leads={leads} notionDocs={notionDocs} />}
             {currentView === 'board' && <KanbanView tasks={tasks} onUpdateTaskStatus={handleUpdateTaskStatus} onAddTask={handleAddTask} />}
             {currentView === 'report' && <ReportView />}
             {currentView === 'knowledge' && <KnowledgeBaseView />}
             {/* Tasks View is now integrated properly if we need a separate view, but Kanban covers it. Let's keep it if needed for 'list' mode */}
        </div>
        
        <SettingsPanel 
            isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
            currentTheme={themeMode} onThemeChange={setThemeMode}
            currentColor={accentColor} onColorChange={setAccentColor}
            currentProfileId={currentUser.id} onProfileChange={(id) => { if (PROFILES[id]) setCurrentUser(PROFILES[id]); }}
        />

        {/* Dock Navigation - Mutually exclusive with Flow */}
        {currentView !== 'flow' && (
        <nav className="fixed bottom-4 left-3 right-3 sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50 animate-in slide-in-from-bottom-6 duration-700 delay-300">
            <div className="relative">
                {/* Voice Core - Floating above - Lowered Position */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-20">
                    <VoiceCore onStateChange={setAudioState} onTaskCreate={handleVoiceTaskCreate} currentUserRole={currentUser.id} />
                </div>

                <div className="liquid-glass rounded-[24px] h-[72px] sm:h-[80px] flex items-center shadow-2xl shadow-black/50 relative overflow-hidden z-10 bg-[#020204]/60 backdrop-blur-xl">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    
                    <div className="flex-1 flex justify-evenly items-center pr-2">
                        <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center gap-1 group transition-all duration-300 ${currentView === 'home' ? '-translate-y-1' : 'opacity-60 hover:opacity-100'}`}>
                            <div className={`p-2 rounded-xl transition-all ${currentView === 'home' ? 'bg-theme-primary text-white shadow-[0_0_15px_var(--primary-dim)]' : 'group-hover:bg-white/5 text-gray-400'}`}>
                                <LayoutGrid size={20} className={currentView === 'home' ? '' : 'icon-duotone'} strokeWidth={1.5} />
                            </div>
                            <span className={`text-[8px] sm:text-[9px] font-bold tracking-wide uppercase transition-colors ${currentView === 'home' ? 'text-white' : 'text-gray-500'}`}>Inicio</span>
                        </button>
                        
                        <button onClick={() => setCurrentView('report')} className={`flex flex-col items-center gap-1 group transition-all duration-300 ${currentView === 'report' ? '-translate-y-1' : 'opacity-60 hover:opacity-100'}`}>
                            <div className={`p-2 rounded-xl transition-all ${currentView === 'report' ? 'bg-theme-primary text-white shadow-[0_0_15px_var(--primary-dim)]' : 'group-hover:bg-white/5 text-gray-400'}`}>
                                <FileChartColumn size={20} className={currentView === 'report' ? '' : 'icon-duotone'} strokeWidth={1.5} />
                            </div>
                            <span className={`text-[8px] sm:text-[9px] font-bold tracking-wide uppercase transition-colors ${currentView === 'report' ? 'text-white' : 'text-gray-500'}`}>Data</span>
                        </button>
                    </div>

                    <div className="w-[70px] sm:w-20 shrink-0"></div>

                    <div className="flex-1 flex justify-evenly items-center pl-2">
                        <button onClick={() => setCurrentView('knowledge')} className={`flex flex-col items-center gap-1 group transition-all duration-300 ${currentView === 'knowledge' ? '-translate-y-1' : 'opacity-60 hover:opacity-100'}`}>
                             <div className={`p-2 rounded-xl transition-all ${currentView === 'knowledge' ? 'bg-theme-primary text-white shadow-[0_0_15px_var(--primary-dim)]' : 'group-hover:bg-white/5 text-gray-400'}`}>
                                <Database size={20} className={currentView === 'knowledge' ? '' : 'icon-duotone'} strokeWidth={1.5} />
                            </div>
                            <span className={`text-[8px] sm:text-[9px] font-bold tracking-wide uppercase transition-colors ${currentView === 'knowledge' ? 'text-white' : 'text-gray-500'}`}>RAG</span>
                        </button>
                        
                        <button onClick={() => setCurrentView('flow')} className={`flex flex-col items-center gap-1 group transition-all duration-300 ${currentView === 'flow' ? '-translate-y-1' : 'opacity-60 hover:opacity-100'}`}>
                            <div className={`p-2 rounded-xl transition-all ${currentView === 'flow' ? 'bg-theme-primary text-white shadow-[0_0_15px_var(--primary-dim)]' : 'group-hover:bg-white/5 text-gray-400'}`}>
                                <MessageSquareText size={20} className={currentView === 'flow' ? '' : 'icon-duotone'} strokeWidth={1.5} />
                            </div>
                            <span className={`text-[8px] sm:text-[9px] font-bold tracking-wide uppercase transition-colors ${currentView === 'flow' ? 'text-white' : 'text-gray-500'}`}>Chat</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
        )}

        {/* Full Screen Flow/Chat Overlay - MOVED TO END & INCREASED Z-INDEX */}
        {currentView === 'flow' && (
             <div className="fixed inset-0 z-[100] bg-[#020204] animate-in slide-in-from-bottom-[10%] duration-300">
                 {/* Re-render background for texture consistency */}
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                 <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[100px] opacity-10 bg-theme-primary pointer-events-none"></div>
                 <FlowView messages={messages} user={currentUser} onClose={() => setCurrentView('home')} />
             </div>
        )}
    </div>
  );
}

export default App;