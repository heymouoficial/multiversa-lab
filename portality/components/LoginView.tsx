import React, { useState } from 'react';
import { ArrowRight, Loader2, Database, Fingerprint, ChevronDown, Check, User } from 'lucide-react';

interface LoginViewProps {
    onLoginSuccess: (email: string) => void;
}

const DEMO_USERS = [
    { id: 'andrea', email: 'andrea@elevat.io', name: 'Andrea Chimaras', role: 'CEO', avatar: 'AC' },
    { id: 'christian', email: 'christian@elevat.io', name: 'Christian Moreno', role: 'Ops Lead', avatar: 'CM' },
    { id: 'moises', email: 'moises@elevat.io', name: 'Moisés D Vera', role: 'Tech Lead', avatar: 'MV' },
];

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [selectedUser, setSelectedUser] = useState(DEMO_USERS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate system boot
    setTimeout(() => {
        onLoginSuccess(selectedUser.email);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#020204]">
      
      {/* 60% Dark Base + 15% Liquid Accent */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      
      {/* Fluid Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-sm animate-in fade-in zoom-in-95 duration-1000">
        
        <div className="text-center mb-12">
          {/* Logo Container - Volumetric Orb */}
          <div className="relative w-28 h-28 mx-auto mb-8 group">
            <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[40px] opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative w-full h-full bg-black rounded-full flex items-center justify-center border border-white/10 shadow-[inset_0_5px_10px_rgba(255,255,255,0.2),0_10px_20px_rgba(0,0,0,0.5)]">
                 <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 to-transparent rounded-full"></div>
                 <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-full"></div>
                 <Database size={40} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] relative z-10" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-5xl font-bold tracking-tighter text-white mb-2 drop-shadow-md">
            Polimata<span className="font-thin text-emerald-400/80">OS</span>
          </h1>
          <p className="text-sm font-medium text-gray-400 tracking-[0.3em] uppercase">Portality Intelligence</p>
        </div>

        {/* 35% Mid-tone Glass Card */}
        <div className="liquid-glass p-8 rounded-[32px] relative overflow-visible group">
          
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent opacity-100 pointer-events-none rounded-[32px]"></div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6 relative z-10">
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Select Profile</label>
              
              {/* Custom Dropdown Trigger */}
              <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 flex items-center justify-between text-left hover:border-emerald-500/30 transition-all group/trigger shadow-inner"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/10">
                            {selectedUser.avatar}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white group-hover/trigger:text-emerald-300 transition-colors">{selectedUser.name}</div>
                            <div className="text-xs text-gray-500">{selectedUser.role}</div>
                        </div>
                    </div>
                    <ChevronDown size={18} className={`text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {DEMO_USERS.map((user) => (
                            <button
                                key={user.id}
                                type="button"
                                onClick={() => { setSelectedUser(user); setIsDropdownOpen(false); }}
                                className={`w-full p-3 flex items-center gap-3 transition-colors ${selectedUser.id === user.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${selectedUser.id === user.id ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400'}`}>
                                    {user.avatar}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className={`text-sm font-medium ${selectedUser.id === user.id ? 'text-white' : 'text-gray-400'}`}>{user.name}</div>
                                </div>
                                {selectedUser.id === user.id && <Check size={16} className="text-emerald-500" />}
                            </button>
                        ))}
                    </div>
                )}
              </div>
            </div>

            {/* Shining Liquid Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 relative group w-full rounded-2xl p-[1px] overflow-hidden transition-transform active:scale-[0.98] shadow-neon disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Spinning Conic Gradient Border */}
              <div className="absolute inset-[-100%] bg-conic from-emerald-600 via-teal-300 to-emerald-600 animate-spin-slow opacity-100"></div>
              
              {/* Inner Button Background */}
              <div className="relative h-full w-full bg-[#050505] rounded-2xl flex items-center justify-center gap-2 py-4 group-hover:bg-[#0A0A0A] transition-colors">
                 {loading ? <Loader2 size={20} className="animate-spin text-white icon-duotone" /> : (
                    <>
                        <span className="text-white font-bold tracking-wide">Initialize Session</span>
                        <ArrowRight size={20} className="text-emerald-400" />
                    </>
                 )}
              </div>
            </button>
          </form>

          <div className="mt-8 text-center flex flex-col gap-2">
            <div className="flex justify-center items-center gap-2 text-[10px] text-gray-500 font-bold tracking-widest">
                <Fingerprint size={12} className="text-gray-600" />
                <span>MULTIVERSA SECURE ENCLAVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;