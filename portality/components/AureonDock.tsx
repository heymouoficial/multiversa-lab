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
        { id: 'dashboard' as ViewState, icon: <LayoutGrid size={22} />, label: 'Home' },
        { id: 'agency' as ViewState, icon: <Database size={22} />, label: 'Datos' },
        { id: 'flow' as ViewState, icon: <Zap size={22} />, label: 'RAG' },
        { id: 'chat' as ViewState, icon: <MessageSquare size={22} />, label: 'Chat' },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md md:hidden">
            {/* DOCK CONTAINER */}
            <div className="relative flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                
                {/* NAVIGATION ITEMS */}
                <div className="flex items-center gap-1 w-full justify-around">
                    {items.slice(0, 2).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`p-3 rounded-2xl transition-all relative ${
                                activeView === item.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {item.icon}
                            {activeView === item.id && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_#fff]"></div>
                            )}
                        </button>
                    ))}

                    {/* CENTRAL AUREON BUTTON */}
                    <button 
                        onClick={onVoiceClick}
                        className="relative -top-10 group"
                    >
                        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                        <div className="relative w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.4)] border-4 border-black group-active:scale-90 transition-transform">
                            <Mic size={28} className="text-white fill-white/20" />
                        </div>
                    </button>

                    {items.slice(2, 4).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`p-3 rounded-2xl transition-all relative ${
                                activeView === item.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {item.icon}
                            {activeView === item.id && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_#fff]"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AureonDock;
