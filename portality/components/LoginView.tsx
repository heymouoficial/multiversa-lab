import React, { useState } from 'react';
import { ArrowRight, Loader2, Database, Fingerprint, Mail, Lock, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginViewProps {
  onLoginSuccess: (email: string) => void;
}

type AuthMode = 'login' | 'signup' | 'reset' | 'reset-sent';

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) throw error;

      // If email confirmation is disabled, auto-login
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
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setMode('reset-sent');
    } catch (err: any) {
      console.error('Reset error:', err);
      setError(err.message || 'Error al enviar email de recuperación');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (mode === 'reset-sent') {
      return (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check size={32} className="text-emerald-400" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-2">Revisa tu correo</h3>
            <p className="text-sm text-gray-400">
              Hemos enviado un enlace a <span className="text-emerald-400">{email}</span>
            </p>
          </div>
          <button
            onClick={() => setMode('login')}
            className="text-sm text-emerald-400 hover:underline flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Volver al login
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handlePasswordReset} className="flex flex-col gap-5 relative z-10">

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>
        </div>

        {/* Password Input (not shown for reset) */}
        {mode !== 'reset' && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Contraseña</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Forgot Password Link */}
        {mode === 'login' && (
          <button
            type="button"
            onClick={() => { setMode('reset'); setError(null); }}
            className="text-xs text-gray-400 hover:text-emerald-400 transition-colors text-right -mt-2"
          >
            ¿Olvidaste tu contraseña?
          </button>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 relative group w-full rounded-2xl p-[1px] overflow-hidden transition-transform active:scale-[0.98] shadow-neon disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-[-100%] bg-conic from-emerald-600 via-teal-300 to-emerald-600 animate-spin-slow opacity-100"></div>
          <div className="relative h-full w-full bg-[#050505] rounded-2xl flex items-center justify-center gap-2 py-4 group-hover:bg-[#0A0A0A] transition-colors">
            {loading ? <Loader2 size={20} className="animate-spin text-white" /> : (
              <>
                <span className="text-white font-bold tracking-wide">
                  {mode === 'login' ? 'Iniciar Sesión' : mode === 'signup' ? 'Crear Cuenta' : 'Enviar Enlace'}
                </span>
                <ArrowRight size={20} className="text-emerald-400" />
              </>
            )}
          </div>
        </button>

        {/* Mode Switch */}
        <div className="flex justify-center gap-1 text-sm">
          {mode === 'login' ? (
            <>
              <span className="text-gray-500">¿No tienes cuenta?</span>
              <button type="button" onClick={() => { setMode('signup'); setError(null); }} className="text-emerald-400 hover:underline font-medium">
                Regístrate
              </button>
            </>
          ) : (
            <button type="button" onClick={() => { setMode('login'); setError(null); }} className="text-emerald-400 hover:underline font-medium flex items-center gap-1">
              <ArrowLeft size={14} /> Volver al login
            </button>
          )}
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#020204]">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-sm animate-in fade-in zoom-in-95 duration-1000">

        <div className="text-center mb-10">
          <div className="relative w-24 h-24 mx-auto mb-6 group">
            <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[40px] opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative w-full h-full bg-black rounded-full flex items-center justify-center border border-white/10 shadow-[inset_0_5px_10px_rgba(255,255,255,0.2),0_10px_20px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 to-transparent rounded-full"></div>
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-full"></div>
              <Database size={36} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] relative z-10" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tighter text-white mb-1 drop-shadow-md">
            Polimata<span className="font-thin text-emerald-400/80">OS</span>
          </h1>
          <p className="text-xs font-medium text-gray-400 tracking-[0.3em] uppercase">Portality Intelligence</p>
        </div>

        <div className="liquid-glass p-6 rounded-[28px] relative overflow-visible">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent opacity-100 pointer-events-none rounded-[28px]"></div>

          {renderForm()}

          <div className="mt-6 text-center flex flex-col gap-2">
            <div className="flex justify-center items-center gap-2 text-[10px] text-gray-500 font-bold tracking-widest">
              <Fingerprint size={12} className="text-gray-600" />
              <span>ELEVAT SECURE ENCLAVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;