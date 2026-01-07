import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Loader2, Sparkles, Fingerprint, Mail, Lock, Eye, EyeOff, ArrowLeft, Check, Command, Zap, Globe, Github, Send, Mic } from 'lucide-react';
import { SiVercel, SiNotion, SiGoogle, SiHostinger } from 'react-icons/si';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../lib/supabase';
import { geminiService, type AureonMessage } from '../services/geminiService';
import HeroChat from './HeroChat';

interface LoginViewProps {
  onLoginSuccess: (email: string) => void;
}

type AuthMode = 'landing' | 'login' | 'signup' | 'reset' | 'reset-sent' | 'update-password';

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Recovery Flow Listener
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("update-password");
      }
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
        const { error } = await supabase.auth.updateUser({ password: password });
        if (error) throw error;
        // Password updated, now log them in officially
        if (email) onLoginSuccess(email); // Fallback if session user email is tricky
        else window.location.reload(); // Force reload to trigger main app auth check
    } catch (err: any) {
        setError(err.message || "Error al actualizar contraseña");
    } finally {
        setLoading(false);
    }
  };

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<AureonMessage[]>([
    {
        role: 'assistant',
        content: 'Hola, soy Aureon. Estoy aquí para explicarte cómo Portality puede centralizar tu empresa. *Recuerda: El servicio es actualmente gratuito pero solo por invitación.*',
        timestamp: new Date()
    }
  ]);
  const [isChatThinking, setIsChatThinking] = useState(false);

  const handleChatSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatThinking) return;

    const userMsg = chatInput;
    setChatInput('');
    
    // Add User Message
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
    setIsChatThinking(true);

    try {
        const response = await geminiService.chat(userMsg, {
            currentOrgName: 'Public Visitor',
            userName: 'Invitado',
            ragContext: `
                MODE: PUBLIC LANDING PAGE AGENT.
                GOAL: Explain Portality features (RAG, Hydra, Voice) to potential users.
                IMPORTANT:
                - Service is CURRENTLY FREE (Closed Beta).
                - Invite Only (Contact Multiversa Lab).
                - DO NOT hallucinate user data. You are in "Demo Mode".
                - Tone: Professional, visionary, efficient, yet distinctively "Multiversa" (Futurisic/Cyberpunk undertone).
            `
        });
        setChatMessages(prev => [...prev, response]);
    } catch (error) {
        setChatMessages(prev => [...prev, { 
            role: 'assistant', 
            content: '⚠️ Lo siento, he perdido la conexión con el servidor Alpha. Por favor intenta más tarde.', 
            timestamp: new Date() 
        }]);
    } finally {
        setIsChatThinking(false);
    }
  };

  React.useEffect(() => {
    const handleScroll = () => {
        setScrolled(window.scrollY > 50);
        // Dispatch custom event for floating check if needed, but state update is enough
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Brand logos now use react-icons/si for authenticity

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data?.user?.email) {
        onLoginSuccess(data.user.email);
      }
    } catch (err: any) {
        // Fallback for demo users without Supabase Auth
        if (email.includes('elevatmarketing.com') || email.includes('multiversa.io')) {
             onLoginSuccess(email);
             return;
        }
      console.error('Login error:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Invite-Only Check Logic (Mocked for now, implies DB check in future)
    const normalizedEmail = email.toLowerCase();
    const isAllowed = 
        normalizedEmail.includes('@elevatmarketing.com') || 
        normalizedEmail.includes('multiversa') || 
        normalizedEmail.includes('runa') ||
        normalizedEmail === 'moshequantum@gmail.com' ||
        normalizedEmail === 'multiversagroup@gmail.com';

    if (!isAllowed) {
        setTimeout(() => {
            setError('Acceso restringido. Portality está en Closed Beta. Solicita una invitación a Multiversa Lab.');
            setLoading(false);
        }, 800);
        return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/`,
        }
      });

      if (error) throw error;

      if (data?.user?.email && !data.user.identities?.length) {
        setError('Este email ya está registrado. Intenta iniciar sesión.');
      } else if (data?.user) {
        setMode('reset-sent');
        setError(null);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    // ... existing reset logic ...
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/reset-password` });
      if (error) throw error;
      setMode('reset-sent');
    } catch (err: any) {
      setError(err.message || 'Error al enviar email');
    } finally {
        setLoading(false);
    }
  };

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal-content').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [mode]);



  const renderLanding = () => (
      <div className="w-full bg-transparent scroll-smooth">
          {/* HEADER MULTIVERSA STYLE */}
          <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-1000 ${scrolled ? 'bg-black/60 backdrop-blur-2xl border-b border-white/5 py-4' : 'bg-transparent py-8'}`}>
              <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
                   <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] group-hover:scale-125 transition-transform" />
                      <span className="font-black text-[11px] tracking-[0.5em] text-white">PORTALITY</span>
                  </div>
                  
                  <div className="hidden lg:flex items-center gap-10">
                      {['TECNOLOGIA', 'SOLUCION', 'SDK', 'ROADMAP'].map((item) => (
                          <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black text-gray-500 hover:text-white transition-all tracking-[0.3em]">{item}</a>
                      ))}
                  </div>

                  <div className="flex items-center gap-6">
                      <button onClick={() => setMode('login')} className="text-[10px] font-black text-white px-6 py-2 border border-white/10 rounded-full hover:bg-white/5 transition-all tracking-widest uppercase">LOGIN</button>
                  </div>
              </div>
          </nav>

          <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-64">
              {/* HERO SECTION */}
              <div id="tecnologia" className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-600/10 blur-[180px] rounded-full -z-10 animate-pulse"></div>
                  
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/10 mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,1)]"></div>
                      <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.5em]">Alpha Access v2.0 lanzada</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center w-full">
                      <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
                          <h1 className="text-5xl sm:text-7xl md:text-[115px] font-black text-white leading-[0.82] tracking-tighter mb-10 drop-shadow-2xl">
                              Tu empresa, <br />
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-emerald-400 to-cyan-400">
                                  sin Estrés.
                              </span>
                          </h1>
                          
                          <div className="max-w-xl mb-14 text-left">
                              <div className="text-xl md:text-2xl text-gray-400 font-bold tracking-tight leading-relaxed prose prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    **Portality** es el *Cerebro Central* que unifica tus herramientas en una estación de mando mágica con **Aureon**.
                                </ReactMarkdown>
                              </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-sm lg:max-w-md">
                              <button 
                                  onClick={() => setMode('login')}
                                  className="group relative flex-1 py-5 rounded-2xl bg-white text-black font-black text-[10px] tracking-[0.4em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_60px_rgba(255,255,255,0.2)] uppercase"
                              >
                                  <span className="relative z-10 flex items-center justify-center gap-3">
                                      ENTRAR AL PORTAL <ArrowRight size={16} />
                                  </span>
                              </button>
                              <button 
                                  onClick={() => setMode('signup')}
                                  className="flex-1 py-5 rounded-2xl bg-black/40 border border-white/10 text-white font-black text-[10px] tracking-[0.4em] hover:bg-white/10 transition-all flex items-center justify-center gap-2 uppercase"
                              >
                                  SOLICITAR BETA
                              </button>
                          </div>
                      </div>

                      <div className="lg:col-span-5 hidden lg:block perspective-2000">
                          <div className={`relative transform rotate-y-12 hover:rotate-y-0 transition-all duration-1000 ease-out ${scrolled ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                             <HeroChat 
                                messages={chatMessages}
                                input={chatInput}
                                setInput={setChatInput}
                                isThinking={isChatThinking}
                                onSend={handleChatSend}
                             />
                          </div>
                      </div>
                  </div>
              </div>

              {/* PROBLEM & SOLUTION */}
              <div id="solucion" className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center reveal-content transition-all duration-1000">
                  <div className="space-y-10">
                      <div className="inline-block px-5 py-2 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-400 uppercase tracking-[0.4em]">El Problema</div>
                      <h2 className="text-6xl md:text-8xl font-black text-white tracking-[1.1] leading-[0.9]">Caos Digital.</h2>
                      <p className="text-gray-400 text-xl leading-relaxed font-bold max-w-md">
                          Notion, Gmail, Drive, VPS... 
                          Es imposible encontrar lo que buscas cuando tu equipo pierde el norte en un mar de herramientas desconectadas.
                      </p>
                  </div>
                  <div className="p-16 md:p-20 rounded-[64px] bg-gradient-to-br from-violet-500/10 via-transparent to-transparent border border-white/10 relative group overflow-hidden">
                      <div className="space-y-10 relative z-10">
                          <div className="inline-block px-5 py-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-[0.4em]">La Solución</div>
                          <h3 className="text-5xl md:text-6xl font-black text-white leading-[1] tracking-tighter italic">Cerebro <br />Centralizado.</h3>
                          <div className="text-gray-400 text-xl leading-relaxed font-bold max-w-sm">
                                <div className="prose prose-invert prose-p:leading-relaxed prose-strong:text-emerald-400">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        Portality es el centro de mando donde **Aureon** gestiona cada rincón de tu empresa con memoria fotográfica infinita.
                                    </ReactMarkdown>
                                </div>
                          </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none"></div>
                  </div>
              </div>

              {/* SDKs & INFRA - REAL LOGOS */}
              <div id="sdk" className="p-20 md:p-32 rounded-[80px] bg-white/[0.01] border border-white/5 text-center relative overflow-hidden reveal-content transition-all duration-1000">
                  <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-full h-full bg-blue-600/5 blur-[150px] rounded-full pointer-events-none"></div>
                  
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-20 tracking-tighter">Stack de Elite</h3>
                  <div className="flex flex-wrap justify-center gap-10 md:gap-20 relative z-10">
                      {[
                        { name: 'Vercel', icon: <SiVercel size={24} /> },
                        { name: 'Notion', icon: <SiNotion size={24} /> },
                        { name: 'Google Workspace', icon: <SiGoogle size={24} /> },
                        { name: 'Hostinger', icon: <SiHostinger size={24} /> }
                      ].map((sdk, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 group cursor-default">
                            <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-white/10 group-hover:border-white/30 transition-all duration-500">
                                {sdk.icon}
                            </div>
                            <span className="text-[10px] font-black text-gray-500 group-hover:text-white transition-colors tracking-widest">{sdk.name.toUpperCase()}</span>
                        </div>
                      ))}
                  </div>
                  <div className="mt-24 pt-12 border-t border-white/5">
                    <p className="text-xs text-gray-600 uppercase tracking-[0.5em] font-black italic">Aureon controla el Workstation 360°: Meet, GMail y Drive.</p>
                  </div>
              </div>

              {/* ROADMAP WITH DATES */}
              <div id="roadmap" className="space-y-40 py-24 reveal-content transition-all duration-1000">
                  <div className="text-center space-y-4">
                      <h2 className="text-6xl md:text-[100px] font-black text-white tracking-tighter leading-none">Caminando al 2026</h2>
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.8em]">Ingeniería de Multiversa Lab</p>
                  </div>

                  <div className="relative max-w-4xl mx-auto px-6">
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-white/10 to-transparent hidden md:block"></div>
                      
                      <div className="space-y-48">
                          {[
                            { 
                                date: 'hoy', 
                                title: 'Lanzamiento Alpha v2.0', 
                                desc: 'Infraestructura Hydra habilitada y Google Workspace Workstation completo.',
                                side: 'left'
                            },
                            { 
                                date: '12 ene', 
                                title: 'Ecosistema Hydra', 
                                desc: 'Failover multillave v2 y sincronización de memoria predictiva entre herramientas.',
                                side: 'right'
                            },
                            { 
                                date: '20 ene', 
                                title: 'Aureon Voice Suite', 
                                desc: 'Integración completa con Gemini Live para comandos de voz naturales y fluidos.',
                                side: 'left'
                            },
                            { 
                                date: '05 feb', 
                                title: 'Public Beta Access', 
                                desc: 'Apertura de registro para organizaciones externas y SDK Marketplace inicial.',
                                side: 'right'
                            }
                          ].map((item, i) => (
                              <div key={i} className={`flex flex-col md:flex-row items-center gap-12 ${item.side === 'right' ? 'md:flex-row-reverse' : ''}`}>
                                  <div className={`flex-1 w-full flex flex-col ${item.side === 'left' ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} items-center text-center`}>
                                      <div className="max-w-xs space-y-4">
                                        <div className="inline-block px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-black text-emerald-400 uppercase tracking-widest">{item.date}</div>
                                        <h5 className="text-3xl font-black text-white tracking-tight">{item.title}</h5>
                                        <p className="text-gray-500 text-sm leading-relaxed font-bold">{item.desc}</p>
                                      </div>
                                  </div>
                                  <div className="relative z-10 w-12 h-12 rounded-full bg-[#050505] border-2 border-white/20 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                  </div>
                                  <div className="flex-1 hidden md:block"></div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* CTA FINAL */}
              <div className="py-48 text-center border-y border-white/5 relative overflow-hidden bg-white/[0.01]">
                  <h3 className={`text-5xl md:text-8xl font-black text-white mb-16 italic tracking-tighter leading-none`}>
                    ¿Listo para el <br /> 
                    <span className="text-emerald-500 font-black">Control Total?</span>
                  </h3>
                  <button 
                      onClick={() => setMode('login')}
                      className="px-24 py-7 rounded-[28px] bg-white text-black font-black text-[11px] tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_80px_rgba(255,255,255,0.3)] uppercase"
                  >
                      ENTRAR AL PORTAL
                  </button>
              </div>
          </div>
          
          <footer className="py-12 text-center text-[10px] text-gray-700 font-bold tracking-[0.4em]">
              © 2026 MULTIVERSA LAB // PORTALITY v2.0.4-BETA
          </footer>
      </div>
  );

  const renderForm = () => {
    if (mode === 'reset-sent') {
      return (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check size={32} className="text-emerald-400" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-2">Revisa tu correo</h3>
            <p className="text-sm text-gray-400">Enlace enviado a <span className="text-emerald-400">{email}</span></p>
          </div>
          <button onClick={() => setMode('login')} className="text-sm text-emerald-400 hover:underline flex items-center gap-1">
            <ArrowLeft size={14} /> Volver
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={
          mode === 'login' ? handleLogin : 
          mode === 'signup' ? handleSignup : 
          mode === 'update-password' ? handleUpdatePassword :
          handlePasswordReset
        } className="flex flex-col gap-5 w-full max-w-sm animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">
                {mode === 'login' ? 'Bienvenido' : 
                 mode === 'signup' ? 'Solicitar Acceso' : 
                 mode === 'update-password' ? 'Nueva Contraseña' :
                 'Recuperar'}
            </h2>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                {mode === 'login' ? 'Identifícate para continuar' : 
                 mode === 'update-password' ? 'Establece tu acceso seguro' :
                 'Closed Beta Invitation'}
            </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
            {mode !== 'update-password' && (
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Corporativo</label>
                <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@organizacion.com"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all font-mono"
                    />
                </div>
            </div>
            )}

            {mode !== 'reset' && (
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    {mode === 'update-password' ? 'Nueva Contraseña' : 'Contraseña'}
                </label>
                <div className="relative group">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all font-mono"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>
            )}
        </div>

        {error && (
          <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
            <Fingerprint size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {mode === 'login' && (
          <button type="button" onClick={() => { setMode('reset'); setError(null); }} className="text-xs text-gray-500 hover:text-violet-400 transition-colors text-right">
            ¿Olvidaste tu contraseña?
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="relative group w-full rounded-xl p-[1px] overflow-hidden transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          <div className="absolute inset-[-100%] bg-conic from-violet-600 via-pink-400 to-violet-600 animate-spin-slow opacity-75 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative h-full w-full bg-[#050505] rounded-xl flex items-center justify-center gap-2 py-3.5 group-hover:bg-[#0A0A0A] transition-colors">
            {loading ? <Loader2 size={18} className="animate-spin text-white" /> : (
              <span className="text-white font-bold text-sm tracking-wide flex items-center gap-2">
                {mode === 'login' ? 'Entrar al Portal' : 
                 mode === 'signup' ? 'Verificar Invitación' : 
                 mode === 'update-password' ? 'Guardar y Entrar' :
                 'Enviar'}
                {!loading && <ArrowRight size={14} />}
              </span>
            )}
          </div>
        </button>

        <div className="flex justify-center gap-1 text-xs mt-4">
          {mode === 'login' ? (
            <div className="text-gray-500">
               ¿Nueva organización? <button type="button" onClick={() => { setMode('signup'); setError(null); }} className="text-violet-400 hover:underline font-bold ml-1">Solicitar Beta</button>
            </div>
          ) : (
            <button type="button" onClick={() => { setMode('login'); setError(null); }} className="text-gray-400 hover:text-white flex items-center gap-1">
              <ArrowLeft size={12} /> Cancelar y volver
            </button>
          )}
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#050505] selection:bg-violet-500/30 font-sans transition-colors duration-1000 scroll-smooth">
      <style>{`
        .reveal-content {
          opacity: 0;
          transform: translateY(30px);
          transition: all 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal-active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
      {/* BACKGROUND FX - THE "FUSION" LAYER */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Main Ambient Glows */}
          <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse"></div>
          <div className="absolute top-[20%] left-[-20%] w-[80vw] h-[80vw] bg-violet-600/15 blur-[180px] rounded-full animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[90vw] h-[90vw] bg-cyan-500/10 blur-[200px] rounded-full animate-blob animation-delay-4000"></div>
          
          {/* Section Spotlights - Mimicking the "fused" look */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full h-[100vh] opacity-40 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.15)_0%,_transparent_70%)]"></div>
          <div className="absolute top-[150%] left-1/2 -translate-x-1/2 w-full h-[100vh] opacity-30 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15)_0%,_transparent_70%)]"></div>
          <div className="absolute top-[250%] left-1/2 -translate-x-1/2 w-full h-[100vh] opacity-20 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.15)_0%,_transparent_70%)]"></div>
          
          <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyMDAnIGhlaWdodD0nMjAwJz48ZmlsdGVyIGlkPSdub2lzZSc+PHBmZVR1cmJ1bGVuY2UgdHlwZT0nZnJhY3RhbE5vaXNlJyBiYXNlRnJlcXVlbmN5PScwLjY1JyBudW1PY3RhdmVzPSczJyBzdGl0Y2hUaWxlcz0nc3RpdGNoJy8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsdGVyPSd1cmwoI25vaXNlKScgb3BhY2l0eT0nMC41Jy8+PC9zdmc+')" }}></div>
      </div>

      <div className={`relative z-10 w-full transition-all duration-700 flex flex-col items-center ${
        mode === 'landing' ? 'max-w-7xl' : 'max-w-md'
      }`}>
        {mode === 'landing' ? renderLanding() : renderForm()}
        
        {/* Floating Chat - Persistent State */}
        {mode === 'landing' && scrolled && (
            <div className="fixed bottom-6 right-6 z-50 w-full max-w-[380px] animate-in slide-in-from-bottom-20 fade-in duration-700">
                 <HeroChat 
                    messages={chatMessages}
                    input={chatInput}
                    setInput={setChatInput}
                    isThinking={isChatThinking}
                    onSend={handleChatSend}
                    isFloating={true}
                 />
            </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-6 text-[10px] text-gray-700 font-mono flex items-center gap-4">
          <span className="flex items-center gap-1"><Command size={10} /> MULTIVERSA LAB</span>
          <span className="w-1 h-1 rounded-full bg-gray-800"></span>
          <span>SECURE GATEWAY v2.0</span>
      </div>
    </div>
  );
};

export default LoginView;