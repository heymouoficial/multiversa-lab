import React from 'react';
import { Briefcase, Clock, User, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { Service } from '../types';

interface ServiceDetailCardProps {
    service: Service;
    clientName?: string;
}

const ServiceDetailCard: React.FC<ServiceDetailCardProps> = ({ service, clientName }) => {
    return (
        <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/10 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-4 text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                <ShieldCheck size={12} />
                Auditoría de Servicio
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{service.name}</h3>
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 mb-6">
                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-bold uppercase">
                    {service.frequency}
                </span>
                {clientName && (
                    <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg">
                        <LinkIcon size={10} /> {clientName}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="p-3 rounded-xl bg-black/20 border border-white/5 group hover:bg-white/5 transition-colors">
                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1.5">Lider Lead</p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-300">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                            {(service.responsibleId || 'A').charAt(0)}
                        </div>
                        {service.responsibleId || 'Sin asignar'}
                    </div>
                </div>
                <div className="p-3 rounded-xl bg-black/20 border border-white/5 group hover:bg-white/5 transition-colors">
                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1.5">Salud Proyecto</p>
                    <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Optimizando
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailCard;