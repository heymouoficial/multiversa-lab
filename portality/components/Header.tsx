import React, { useState, useEffect } from 'react';
import { 
    Activity, ShieldCheck, Wifi, Cpu, 
    Monitor, HardDrive, Network, Globe,
    ChevronDown, Bell, Clock
} from 'lucide-react';
import { UserProfile } from '../types';
import { getCurrentBrand } from '../config/branding';
import { vpsService, VPSMetrics } from '../services/vpsService';

interface HeaderProps {
    user: UserProfile;
    onMobileMenuToggle?: () => void;
    isMobileMenuOpen?: boolean;
    activeView: ViewState;
}

const VIEW_LABELS: Record<string, string> = {
    'home': 'Inicio',
    'agency': 'Agencia',
    'flow': 'Flow (RAG)',
    'connections': 'Conexiones',
    'team': 'Equipos',
};

const Header: React.FC<HeaderProps> = ({ user, onMobileMenuToggle, isMobileMenuOpen, activeView }) => {
    const brand = getCurrentBrand();
    const [time, setTime] = useState(new Date());
    const [metrics, setMetrics] = useState<VPSMetrics | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        
        const fetchMetrics = async () => {
            const data = await vpsService.getStatus();
            setMetrics(data);
        };

        const isDev = import.meta.env.DEV;
        fetchMetrics();
        
        // Only poll metrics in production or with long interval in dev to avoid CORS noise
        const metricsInterval = setInterval(fetchMetrics, isDev ? 60000 : 5000);

        return () => {
            clearInterval(timer);
            clearInterval(metricsInterval);
        };
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-VE', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        }).toUpperCase();
    };

    return (
        <header className="fixed top-0 right-0 left-0 md:left-[72px] h-12 z-40 px-6 flex justify-between items-center bg-white/[0.01] backdrop-blur-[40px] border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.1)] select-none overflow-hidden">
            {/* LIQUID GLASS GLARE */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none"></div>
            {/* LEFT: SYSTEM STATUS / BREADCRUMBS */}
            <div className="flex items-center gap-4">
                {/* MOBILE MENU TOGGLE */}
                <button 
                    className="md:hidden p-2 text-white/70 hover:text-white z-50 mr-2"
                    onClick={() => onMobileMenuToggle?.()}
                >
                    <ChevronDown className={`transform transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest hidden lg:inline">AUREON OS</span>
                </div>
                
                {/* BREADCRUMB INDICATOR */}
                <div className="h-4 w-[1px] bg-white/10 hidden lg:block"></div>
                <div className="text-[11px] font-bold text-white/80 flex items-center gap-2 overflow-hidden whitespace-nowrap">
                    <span className="text-white/40">/</span>
                    <span className="uppercase tracking-wider">{VIEW_LABELS[activeView] || activeView}</span>
                </div>
            </div>

            {/* RIGHT: MACOS STATUS BAR STYLE */}
            <div className="hidden md:flex items-center gap-6">
                {/* VPS BADGE - Compact */}
                 <div className="text-[10px] font-bold text-white/50 flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <Monitor size={10} className="text-indigo-400" />
                    <span>VPS FIN-01</span>
                </div>

                {/* MONITORING ICONS */}
                <div className="flex items-center gap-4 bg-white/[0.03] px-3 py-1 rounded-full border border-white/5">
                    <div className="flex items-center gap-1.5 group cursor-help" title={`CPU: ${metrics?.cpu.toFixed(1)}%`}>
                        <Cpu size={13} className={metrics && metrics.cpu > 80 ? 'text-red-400' : 'text-emerald-400/70'} />
                        <span className="text-[9px] font-mono text-white/60">{metrics ? `${Math.round(metrics.cpu)}%` : '--'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 group cursor-help" title={`RAM: ${metrics?.ram.toFixed(1)}%`}>
                        <Activity size={13} className="text-purple-400/70" />
                        <span className="text-[9px] font-mono text-white/60">{metrics ? `${Math.round(metrics.ram)}%` : '--'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 group cursor-help" title={`Disk: ${metrics?.disk}%`}>
                        <HardDrive size={13} className="text-blue-400/70" />
                        <span className="text-[9px] font-mono text-white/60">{metrics ? `${metrics.disk}%` : '--'}</span>
                    </div>
                </div>

                {/* NETWORK & SERVICES */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">ONLINE</span>
                    </div>
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <Network size={14} className="text-white/30 group-hover:text-emerald-400 transition-colors" />
                        <Globe size={14} className="text-white/30 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    
                    <div className="h-4 w-[1px] bg-white/10"></div>
                    
                    <div className="flex items-center gap-3">
                        <Bell size={14} className="text-white/40 hover:text-white transition-colors cursor-pointer" />
                        <div className="flex items-center gap-2 text-[10px] font-black text-white/90 tracking-tighter">
                            <span>{formatTime(time)}</span>
                        </div>
                    </div>
                </div>

                {/* USER COMPACT */}
                <div className="flex items-center gap-2 pl-2 border-l border-white/10 ml-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-black shadow-lg shadow-indigo-500/20">
                        {user.avatar}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
