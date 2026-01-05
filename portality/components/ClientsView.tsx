import React from 'react';
import { 
    Users, Plus, Search, Filter, ArrowUpRight, 
    Building2, Phone, Mail, Calendar, CheckCircle2
} from 'lucide-react';
import { Client } from '../types';

interface ClientsViewProps {
    clients: Client[];
}

const ClientsView: React.FC<ClientsViewProps> = ({ clients }) => {
    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{clients.length} ACTIVOS</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic">
                        Cartera <span className="text-indigo-500">2026</span>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-lg">
                        Gestiona tus clientes activos. Cada tarjeta enlaza directamente con su página en Notion.
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar cliente..." 
                            className="pl-11 pr-4 py-3 bg-white/5 rounded-2xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition-all"
                        />
                    </div>
                    <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all">
                        <Filter size={18} />
                    </button>
                    <button className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                        <Plus size={16} />
                        Nuevo
                    </button>
                </div>
            </div>

            {/* CLIENT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                    <div 
                        key={client.id} 
                        className="liquid-glass bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] rounded-full group-hover:bg-indigo-500/10 transition-all"></div>
                        
                        <div className="relative z-10 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white tracking-tight group-hover:text-indigo-300 transition-colors">{client.name}</h3>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{client.type}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                    client.status === 'active' 
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                    {client.status === 'active' ? 'Activo' : 'Onboarding'}
                                </span>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-white/5">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Mail size={12} />
                                    <span className="text-[10px] font-bold truncate">{client.email || 'Sin email registrado'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Calendar size={12} />
                                    <span className="text-[10px] font-bold">Desde {client.startDate || 'Ene 2026'}</span>
                                </div>
                            </div>

                            <button className="w-full mt-2 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/20 transition-all group/btn active:scale-95">
                                Ver en Notion
                                <ArrowUpRight size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}

                {clients.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                            <Users className="text-gray-600" size={32} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Sin clientes registrados</h3>
                        <p className="text-gray-500 max-w-sm mx-auto text-sm">
                            Sincroniza tu base de datos de Notion o agrega un nuevo cliente manualmente.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientsView;
