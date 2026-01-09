import React from 'react';
import { User, Circle, Sparkles } from 'lucide-react';

interface TeamAvailabilitySnippetProps {
    name: string;
    role: string;
    taskCount: number;
    status: 'online' | 'busy' | 'offline';
}

const TeamAvailabilitySnippet: React.FC<TeamAvailabilitySnippetProps> = ({ name, role, taskCount, status }) => {
    const getStatusStyles = () => {
        switch (status) {
            case 'online': return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' };
            case 'busy': return { text: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400' };
            default: return { text: 'text-gray-500', bg: 'bg-gray-500/10', dot: 'bg-gray-500' };
        }
    };

    const styles = getStatusStyles();

    return (
        <div className="mt-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                    <User size={20} className="text-white/30" />
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0b] ${styles.dot}`} />
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-xs font-bold text-white truncate">{name}</h4>
                    {status === 'online' && <Sparkles size={10} className="text-emerald-400 animate-pulse" />}
                </div>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{role}</p>
            </div>

            <div className="text-right px-2 py-1 rounded-lg bg-black/20 border border-white/5">
                <p className="text-xs font-black text-white leading-none">{taskCount}</p>
                <p className="text-[8px] text-gray-600 font-black uppercase tracking-tighter mt-1">Capacidad</p>
            </div>
        </div>
    );
};

export default TeamAvailabilitySnippet;