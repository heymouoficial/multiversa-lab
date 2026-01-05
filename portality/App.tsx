import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { ragService } from './services/ragService';
import LoginView from './components/LoginView';
import { SettingsPanel } from './components/SettingsPanel';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AureonDock from './components/AureonDock';
import HomeView from './components/HomeView';
import NotionView from './components/NotionView';
import RAGView from './components/RAGView';
import FloatingChat from './components/FloatingChat';
import { Task, Lead, ViewState, AudioState, ChatMessage, UserProfile, NotionPage, CalendarEvent, Client } from './types';
import { THEMES } from './constants';
import { getCurrentBrand, applyBrandColors } from './config/branding';

const brand = getCurrentBrand();

const PROFILES: Record<string, UserProfile> = {
    andrea: { 
        id: 'andrea', name: 'Andrea Chimaras', role: 'CEO (Strategic)', avatar: 'AC', theme: 'emerald', organizationId: 'ELEVAT/AGORA',
        layoutConfig: ['status', 'portfolio', 'chronos', 'tasks'] 
    },
    christian: { 
        id: 'christian', name: 'Christian Moreno', role: 'Ops Lead', avatar: 'CM', theme: 'emerald', organizationId: 'ELEVAT/AGORA',
        layoutConfig: ['status', 'tasks', 'portfolio'] 
    },
    moises: { 
        id: 'moises', name: 'Moisés D Vera', role: 'Tech Lead', avatar: 'MV', theme: 'emerald', organizationId: 'ELEVAT/AGORA',
        layoutConfig: ['status', 'hub', 'tasks', 'links', 'portfolio', 'chronos'] 
    },
    astursadeth: {
        id: 'astursadeth' as any, name: 'Architect', role: 'Owner', avatar: 'AS', theme: 'violet', organizationId: 'PERSONAL',
        layoutConfig: ['status', 'tasks', 'links', 'chronos']
    }
};

const EMAIL_TO_PROFILE: Record<string, string> = {
    'andreachimarasonlinebusiness@gmail.com': 'andrea',
    'christomoreno6@gmail.com': 'christian',
    'moshequantum@gmail.com': 'moises',
    'andrea@elevat.io': 'andrea',
    'christian@elevat.io': 'christian',
    'moises@elevat.io': 'moises'
};

const SESSION_TIMEOUT_MS = 90 * 60 * 1000; // 90 Minutes

const GLOBAL_LEADS: Lead[] = [
    { id: '1', initials: 'EL', name: 'Elevat Latam', status: 'Hot', detail: 'Interesado en MVP', color: 'bg-gradient-to-br from-blue-500 to-purple-600' },
    { id: '2', initials: 'SA', name: 'Studio Alpha', status: 'New', detail: 'Agendó demo', color: 'bg-gray-200 dark:bg-gray-800 !text-gray-600 dark:!text-gray-300' },
    { id: '3', initials: 'NX', name: 'Nux Agency', status: 'Won', detail: 'Pago recibido', color: 'bg-lime-500 text-black' },
];

export default function App() {
    const [session, setSession] = useState<any>(null);
    const [loadingSession, setLoadingSession] = useState(true);
    const [demoAuthenticated, setDemoAuthenticated] = useState(false);

    const [currentUser, setCurrentUser] = useState<UserProfile>(
        brand.id === 'astursadeth' ? PROFILES.astursadeth : PROFILES.andrea
    );
    const [currentView, setCurrentView] = useState<ViewState>('home');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [themeMode, setThemeMode] = useState<string>('dark');
    const [audioState, setAudioState] = useState<AudioState>(AudioState.IDLE);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [notionDocs, setNotionDocs] = useState<NotionPage[]>([]);
    const [trainingMode, setTrainingMode] = useState<{ active: boolean; reason: string }>({ active: false, reason: '' });
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [leads] = useState<Lead[]>(GLOBAL_LEADS);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // Activity Tracking for 90-min expiry
    const [lastActivity, setLastActivity] = useState<number>(Date.now());

    // Multi-Org State
    const [currentOrgId, setCurrentOrgId] = useState<string>('multiversa');
    const organizations = [
        { id: 'multiversa', name: 'Multiversa Lab', slug: 'multiversa-lab' },
        { id: 'elevat', name: 'Elevat / ÁGORA', slug: 'elevat-agora' },
        { id: 'runa', name: 'Runa Script', slug: 'runa-script' }
    ];

    // Dynamic Branding Effect
    useEffect(() => {
        const brandConfig = getCurrentBrand(currentOrgId);
        document.title = `${brandConfig.name} | Portality`;
        applyBrandColors(brandConfig);
        
        // Update user org in state logic if needed, but keeping simple for now
    }, [currentOrgId]);

    useEffect(() => {
        if (!session && !demoAuthenticated) return;
        
        const checkSession = () => {
            const now = Date.now();
            if (now - lastActivity > SESSION_TIMEOUT_MS) {
                console.log("Session expired due to inactivity");
                handleLogout();
            }
        };

        const interval = setInterval(checkSession, 60000); // Check every minute
        
        const resetActivity = () => setLastActivity(Date.now());
        window.addEventListener('mousemove', resetActivity);
        window.addEventListener('keydown', resetActivity);
        window.addEventListener('click', resetActivity);

        return () => {
            clearInterval(interval);
            window.removeEventListener('mousemove', resetActivity);
            window.removeEventListener('keydown', resetActivity);
            window.removeEventListener('click', resetActivity);
        };
    }, [session, demoAuthenticated, lastActivity]);

    // Init Auth & Persistence
    useEffect(() => {
        document.title = `${brand.name} | Portality`;
        const persistedDemoUser = localStorage.getItem('polimata_demo_user');

        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                if (session) {
                    setSession(session);
                    if (session?.user?.email) mapUserFromSession(session.user.email);
                    setLoadingSession(false);
                } else if (persistedDemoUser) {
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
        const profileId = EMAIL_TO_PROFILE[email.toLowerCase()];
        if (profileId && PROFILES[profileId]) {
            setCurrentUser(PROFILES[profileId]);
        } else {
            // Fuzzy match for domain or local part if needed
            const foundKey = Object.keys(EMAIL_TO_PROFILE).find(key => email.toLowerCase().includes(key));
            if (foundKey) {
                setCurrentUser(PROFILES[EMAIL_TO_PROFILE[foundKey]]);
            } else {
                setCurrentUser({ ...PROFILES.andrea, id: 'moises' as any, name: email.split('@')[0] });
            }
        }
    };

    const handleAuthSuccess = (email: string) => {
        mapUserFromSession(email);
        setLastActivity(Date.now());
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('polimata_demo_user');
        setDemoAuthenticated(false);
        setSession(null);
    };

    // Load User Data & RAG Context
    useEffect(() => {
        if (!currentUser) return;

        const fetchTasks = async () => {
            try {
                // Simple query first - avoid complex filters that may fail
                const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
                
                if (error) throw error;
                
                if (data && data.length > 0) {
                    setTasks(data.map(t => ({
                        id: t.id,
                        title: t.title,
                        priority: t.priority || 'medium',
                        status: t.status || 'todo',
                        completed: t.completed || false,
                        tags: t.tags || [],
                        assignedTo: t.assigned_to || 'MV',
                        organizationId: t.organization_id || 'ELEVAT'
                    })));
                    return;
                }
            } catch (err) {
                console.log('[Tasks] DB not available, using fallback');
            }
            
            // Fallback Mock - Multi-Org Tasks
            setTasks([
                // Elevat Tasks
                { id: 't1', title: 'Reunión Clínica Pro Salud', priority: 'high', status: 'todo', completed: false, tags: ['Cliente'], assignedTo: 'AC', organizationId: 'elevat' },
                { id: 't2', title: 'Propuesta Your Sign World', priority: 'medium', status: 'todo', completed: false, tags: ['Ventas'], assignedTo: 'AC', organizationId: 'elevat' },
                { id: 't3', title: 'Estrategia ÁGORA Q1', priority: 'medium', status: 'todo', completed: false, tags: ['Estrategia'], assignedTo: 'AC', organizationId: 'elevat' },
                { id: 't4', title: 'Web Directorist (Elementor)', priority: 'high', status: 'todo', completed: false, tags: ['Web'], assignedTo: 'CM', organizationId: 'elevat' },
                
                // Multiversa Lab Tasks (Owner)
                { id: 'm1', title: 'Infraestructura Portality VPS', priority: 'high', status: 'in-progress', completed: false, tags: ['Lab', 'Infra'], assignedTo: 'MV', organizationId: 'multiversa' },
                { id: 'm2', title: 'Definir Roadmap Hydra', priority: 'medium', status: 'todo', completed: false, tags: ['Strategy'], assignedTo: 'AS', organizationId: 'multiversa' },

                // Runa Script Tasks (Wife/Family)
                { id: 'r1', title: 'Planificación Semanal', priority: 'medium', status: 'todo', completed: false, tags: ['Home'], assignedTo: 'RS', organizationId: 'runa' },
                { id: 'r2', title: 'Revisión Presupuesto', priority: 'high', status: 'todo', completed: false, tags: ['Finance'], assignedTo: 'RS', organizationId: 'runa' }
            ]);
        };
        fetchTasks();

        // Load Clients
        const loadClients = async () => {
            try {
                const { data, error } = await supabase.from('clients').select('*');
                if (error) throw error;
                if (data && data.length > 0) {
                    setClients(data);
                    return;
                }
            } catch (err) {
                console.log('[Clients] DB not available, using fallback');
            }
            // Fallback Mock
            setClients([
                { id: 'c1', name: 'Clínica Pro Salud', type: 'fixed', status: 'active', logo: '🏥' },
                { id: 'c2', name: 'Your Sign World', type: 'project', status: 'active', logo: '🪧' },
                { id: 'c3', name: 'D Mart Parts', type: 'project', status: 'active', logo: '🚗' },
                { id: 'c4', name: 'Torres Cabrera Law', type: 'fixed', status: 'active', logo: '⚖️' }
            ]);
        };
        loadClients();

        const channel = supabase.channel('tasks_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
                fetchTasks();
            })
            .subscribe();

        const fetchEvents = async () => {
            const { data } = await supabase.from('events').select('*').order('start_time', { ascending: true }).limit(5);
            if (data) {
                setEvents(data.map(e => ({
                    id: e.id,
                    title: e.title,
                    startTime: new Date(e.start_time),
                    type: e.type,
                    link: e.link,
                    description: e.description
                })));
            }
        };
        fetchEvents();

        const loadDocs = async () => {
            const result = await ragService.getDashboardDocs(currentUser.id);
            setNotionDocs(result.docs);
            setTrainingMode({ active: result.trainingMode, reason: result.reason });
        };
        loadDocs();

        setAccentColor(currentUser.theme);
        setMessages([
            { id: Date.now().toString(), role: 'assistant', content: brand.defaultAssistantMessage, timestamp: new Date() }
        ]);

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser, session]);


    const handleAddTask = async (title: string, priority: 'high' | 'medium' | 'low', status: Task['status'] = 'todo') => {
        const newTaskPayload = {
            title,
            priority,
            status,
            completed: false,
            tags: ['Inbox'],
            assigned_to: currentUser.avatar,
            user_id: session?.user?.id
        };

        // Optimistic UI Update
        const tempId = Date.now().toString();
        const optimisticTask: Task = {
            id: tempId,
            ...newTaskPayload,
            assignedTo: currentUser.avatar
        } as Task;
        setTasks(prev => [optimisticTask, ...prev]);

        // Real Insert
        const { data, error } = await supabase.from('tasks').insert(newTaskPayload).select().single();
        if (data) {
            setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: data.id } : t));
        } else {
            console.error('Error adding task:', error);
            setTasks(prev => prev.filter(t => t.id !== tempId)); // Revert on error
        }
    };

    const handleUpdateTaskStatus = async (id: string, newStatus: Task['status']) => {
        // Optimistic
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, completed: newStatus === 'done' } : t));

        // Real
        await supabase.from('tasks').update({ status: newStatus, completed: newStatus === 'done' }).eq('id', id);
    };

    const handleToggleTask = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const newCompleted = !task.completed;
        const newStatus = newCompleted ? 'done' : 'todo';

        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: newCompleted, status: newStatus } : t));

        await supabase.from('tasks').update({ completed: newCompleted, status: newStatus }).eq('id', id);
    };

    const handleDeleteTask = async (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        await supabase.from('tasks').delete().eq('id', id);
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

    if (loadingSession) return <div className="min-h-screen bg-[#020203] flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div></div>;
    if (!session) return <LoginView onLoginSuccess={handleAuthSuccess} />;

    return (
        <div className="min-h-screen bg-[#020203] text-white selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden font-sans">
            {/* LIQUID GLASS BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* SMOOTH GRADIENTS - MORE VISIBLE */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-gradient-to-br from-cyan-500/20 via-cyan-400/10 to-transparent blur-[80px] animate-[pulse_8s_ease-in-out_infinite]"></div>
                    <div className="absolute top-[10%] right-[-5%] w-[45%] h-[45%] bg-gradient-to-bl from-indigo-500/25 via-purple-500/15 to-transparent blur-[100px] animate-[pulse_10s_ease-in-out_infinite_1s]"></div>
                    <div className="absolute bottom-[5%] left-[15%] w-[35%] h-[35%] bg-gradient-to-tr from-purple-600/20 via-pink-500/10 to-transparent blur-[80px] animate-[pulse_12s_ease-in-out_infinite_2s]"></div>
                </div>
                {/* SUBTLE GRID - MORE VISIBLE */}
                <div 
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px'
                    }}
                ></div>
                {/* NOISE TEXTURE - CSS ONLY */}
                <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}></div>
            </div>

            <Sidebar 
                activeView={currentView} 
                onNavigate={setCurrentView} 
                user={currentUser} 
                onLogout={handleLogout} 
                organizations={organizations}
                currentOrgId={currentOrgId}
                onSwitchOrg={setCurrentOrgId}
            />

            <main className={`flex-1 relative min-h-screen flex flex-col transition-all duration-300 ${
                'md:ml-[72px]' // Match collapsed sidebar width
            }`}>
                <Header user={currentUser} />

                <div className="flex-1 mt-14 pb-24">
                    {currentView === 'home' && (
                        <HomeView 
                            user={currentUser}
                            tasks={tasks.filter(t => t.organizationId === currentOrgId)}
                            clients={clients}
                            onNavigate={setCurrentView}
                            onToggleTask={handleToggleTask}
                        />
                    )}

                    {currentView === 'agency' && (
                        <NotionView 
                            clients={clients}
                            tasks={tasks.filter(t => t.organizationId === currentOrgId)}
                            onToggleTask={handleToggleTask}
                        />
                    )}

                    {currentView === 'flow' && <RAGView />}
                </div>
            </main>

            {/* FLOATING CHAT - AUREON UI2GEN */}
            <FloatingChat 
                tasks={tasks.filter(t => t.organizationId === currentOrgId)}
                userName={currentUser.full_name}
                pendingTaskCount={tasks.filter(t => t.organizationId === currentOrgId && !t.completed).length}
                onNavigate={setCurrentView}
                onAddTask={(task) => {
                    const newTask = {
                        id: `t${Date.now()}`,
                        title: task.title,
                        priority: task.priority as 'high' | 'medium' | 'low',
                        status: 'todo' as const,
                        completed: false,
                        tags: [],
                        assignedTo: task.assignedTo,
                        organizationId: 'ELEVAT'
                    };
                    setTasks(prev => [...prev, newTask]);
                }}
            />

            <AureonDock 
                activeView={currentView} 
                onNavigate={setCurrentView} 
                onVoiceClick={() => alert('Aureon Voice System Iniciado...')} 
            />

            <SettingsPanel
                isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
                currentTheme={themeMode} onThemeChange={setThemeMode}
                currentColor={accentColor} onColorChange={setAccentColor}
                currentProfileId={currentUser.id} onProfileChange={(id) => { if (PROFILES[id]) setCurrentUser(PROFILES[id]); }}
            />
        </div>
    );
}
