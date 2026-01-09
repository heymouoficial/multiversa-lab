import React from 'react';
import { LayoutGrid, Database, Zap, MessageSquare, Mic } from 'lucide-react';
import { ViewState } from '../types';

interface AureonDockProps {
    activeView: ViewState;
    onNavigate: (view: ViewState) => void;
    onVoiceClick: () => void;
}

const AureonDock: React.FC<AureonDockProps> = ({ activeView, onNavigate, onVoiceClick }) => {
    const items = [
        { id: 'home' as ViewState, icon: <LayoutGrid size={22} />, label: 'Home' },
        { id: 'agency' as ViewState, icon: <Database size={22} />, label: 'Datos' },
        { id: 'flow' as ViewState, icon: <Zap size={22} />, label: 'RAG' },
        { id: 'chat' as ViewState, icon: <MessageSquare size={22} />, label: 'Chat' },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-md md:hidden">
            {/* DOCK CONTAINER */}
            <div className="relative flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                
                <div className="flex items-center gap-1 w-full justify-around">
                    {items.slice(0, 2).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all relative ${
                                activeView === item.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <div className={activeView === item.id ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : ''}>
                                {item.icon}
                            </div>
                            <span className={`text-[10px] font-medium leading-none ${activeView === item.id ? 'text-white' : 'text-gray-500'}`}>
                                {item.label === 'Home' ? 'Inicio' : item.label}
                            </span>
                        </button>
                    ))}

                    {/* CENTRAL AUREON BUTTON */}
                    <button 
                        onClick={onVoiceClick}
                        className="group flex flex-col items-center justify-center gap-1 p-2 rounded-2xl relative"
                    >
                        {/* Placeholder for alignment with other icons */}
                        <div className="w-[22px] h-[22px]" />
                        
                        {/* Orb positioned absolutely to float */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                                <div className="relative w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.4)] border-4 border-black group-active:scale-90 transition-transform">
                                    <Mic size={24} className="text-white fill-white/20" />
                                </div>
                            </div>
                        </div>

                        <span className="text-[10px] font-bold text-emerald-400 tracking-wide uppercase drop-shadow-md">Aureon</span>
                    </button>

                    {items.slice(2, 4).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all relative ${
                                activeView === item.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <div className={activeView === item.id ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : ''}>
                                {item.icon}
                            </div>
                            <span className={`text-[10px] font-medium leading-none ${activeView === item.id ? 'text-white' : 'text-gray-500'}`}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AureonDock;
