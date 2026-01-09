import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Zap, LayoutGrid, Clock } from 'lucide-react';
import { AudioState } from '../types';

interface AureonCallModalProps {
    isOpen: boolean;
    audioState: AudioState;
    onHangUp: () => void;
}

export const AureonCallModal: React.FC<AureonCallModalProps> = ({
    isOpen,
    audioState,
    onHangUp,
}) => {
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setCallDuration(0);
            return;
        }

        const timer = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    const isListening = audioState === AudioState.LISTENING;
    const isSpeaking = audioState === AudioState.SPEAKING;

    return (
        <div className="fixed inset-0 z-[150] bg-[#020205]/90 backdrop-blur-3xl flex flex-col items-center justify-between py-12 px-8 animate-in fade-in duration-500 overflow-hidden select-none">
            {/* Ambient Glows */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-indigo-500/10 blur-[120px] rounded-full transition-opacity duration-1000 ${isSpeaking ? 'opacity-100' : 'opacity-40'}`} />
            
            {/* Header info */}
            <div className="flex flex-col items-center gap-2 z-10">
                <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                    <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-pulse' : isListening ? 'bg-indigo-400' : 'bg-gray-500'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                        {isSpeaking ? 'Aureon hablando' : isListening ? 'Escuchando...' : 'Conectando'}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-white/40 font-mono text-sm tracking-widest">
                    <Clock size={14} />
                    {formatTime(callDuration)}
                </div>
            </div>

            {/* Central Avatar Section */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full z-10">
                <div className="relative">
                    {/* Animated Rings for Voice */}
                    <div className="absolute inset-0 -scale-110">
                        <div className={`absolute inset-0 rounded-full border-2 border-emerald-500/20 transition-all duration-700 ${isSpeaking ? 'scale-150 opacity-0' : 'scale-100 opacity-20'}`} />
                        <div className={`absolute inset-0 rounded-full border-2 border-indigo-500/20 transition-all duration-700 delay-150 ${isSpeaking ? 'scale-125 opacity-0' : 'scale-100 opacity-10'}`} />
                    </div>

                    {/* Avatar Container */}
                    <div className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full p-1.5 transition-all duration-500 ${
                        isSpeaking ? 'bg-emerald-500/50 shadow-[0_0_80px_rgba(16,185,129,0.3)]' : 
                        isListening ? 'bg-indigo-500/30' : 'bg-white/10'
                    }`}>
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-black">
                            <img 
                                src="/aureon.webp" 
                                alt="Aureon AI" 
                                className={`w-full h-full object-cover transition-transform duration-700 ${isSpeaking ? 'scale-110' : 'scale-100'}`}
                            />
                        </div>

                        {/* Visualizer overlay */}
                        {isSpeaking && (
                            <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none">
                                {[1,2,3,4,5].map(i => (
                                    <div 
                                        key={i} 
                                        className="w-1.5 bg-white/40 rounded-full animate-bounce" 
                                        style={{ height: `${Math.random() * 40 + 20}%`, animationDelay: `${i * 0.1}s` }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Badge */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-black border border-white/20 rounded-2xl shadow-xl">
                        <p className="text-xl font-black text-white tracking-tight">Aureon AI</p>
                    </div>
                </div>

                <div className="text-center max-w-xs px-6">
                    <p className="text-gray-400 text-sm leading-relaxed italic">
                        "Enlightenment through operational intelligence."
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-8 z-10 pb-4">
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-5 rounded-full border transition-all ${
                        isMuted ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/10 text-white/50 hover:bg-white/5'
                    }`}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button 
                    onClick={onHangUp}
                    className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-[0_20px_40px_rgba(244,63,94,0.3)] hover:scale-110 active:scale-95 transition-all"
                >
                    <PhoneOff size={32} strokeWidth={2.5} />
                </button>

                <button className="p-5 rounded-full border border-white/10 text-white/50 hover:bg-white/5 transition-all">
                    <Zap size={24} />
                </button>
            </div>

            {/* Quick Actions overlay (Bottom) */}
            <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm z-10 opacity-60">
                <div className="flex flex-col items-center gap-1.5 p-4 bg-white/5 rounded-3xl border border-white/10">
                    <LayoutGrid size={18} className="text-emerald-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Dashboard</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-4 bg-white/5 rounded-3xl border border-white/10">
                    <Mic size={18} className="text-indigo-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Live Sync</span>
                </div>
            </div>

            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(2); }
                }
            `}</style>
        </div>
    );
};
