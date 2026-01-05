import React, { useState } from 'react';
import { 
    Users, Briefcase, CheckSquare, Search, 
    Plus, ExternalLink, ChevronRight, Clock,
    Mail, Phone, Building
} from 'lucide-react';
import { Task, Client } from '../types';
import { getCurrentBrand } from '../config/branding';

interface NotionViewProps {
    clients: Client[];
    tasks: Task[];
    onToggleTask?: (id: string) => void;
}

type TabId = 'clientes' | 'servicios' | 'tareas';

const NotionView: React.FC<NotionViewProps> = ({ clients, tasks, onToggleTask }) => {
    const brand = getCurrentBrand();
    const [activeTab, setActiveTab] = useState<TabId>('clientes');
    const [searchQuery, setSearchQuery] = useState('');

    const tabs = [
        { id: 'clientes' as TabId, label: 'Clientes', icon: <Users size={16} />, count: clients.length },
        { id: 'servicios' as TabId, label: 'Servicios', icon: <Briefcase size={16} />, count: 6 },
        { id: 'tareas' as TabId, label: 'Tareas', icon: <CheckSquare size={16} />, count: tasks.length },
    ];

    // Mock services data
    const services = [
        { id: 's1', name: 'Manejo de Redes Sociales', clients: 4, status: 'active' },
        { id: 's2', name: 'Desarrollo Web', clients: 3, status: 'active' },
        { id: 's3', name: 'Google Ads', clients: 2, status: 'active' },
        { id: 's4', name: 'Branding', clients: 2, status: 'active' },
        { id: 's5', name: 'Email Marketing', clients: 1, status: 'pending' },
        { id: 's6', name: 'Automatización', clients: 1, status: 'pending' },
    ];

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTasks = tasks.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Datos</h1>
                    <p className="text-sm text-gray-500">Información sincronizada desde Notion</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar..."
                            className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-white/20 w-48"
                        />
                    </div>
                    <button 
                        className="p-2 rounded-xl text-white flex items-center gap-2"
                        style={{ backgroundColor: brand.colors.primary }}
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div className="flex gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-xl mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all text-sm font-medium ${
                            activeTab === tab.id 
                                ? 'bg-white/10 text-white' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10">{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden">
                {/* CLIENTES TAB */}
                {activeTab === 'clientes' && (
                    <div className="divide-y divide-white/5">
                        {filteredClients.length > 0 ? filteredClients.map((client) => (
                            <div key={client.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-all">
                                <div 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                                    style={{ backgroundColor: `${brand.colors.accent}30` }}
                                >
                                    {client.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{client.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{client.email || 'Sin email'}</p>
                                </div>
                                <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Building size={12} />
                                        {client.company || 'Empresa'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span 
                                        className="text-[9px] font-bold uppercase px-2 py-1 rounded-full"
                                        style={{ 
                                            backgroundColor: client.status === 'active' ? `${brand.colors.success}15` : `${brand.colors.warning}15`,
                                            color: client.status === 'active' ? brand.colors.success : brand.colors.warning
                                        }}
                                    >
                                        {client.status === 'active' ? 'Activo' : 'Pendiente'}
                                    </span>
                                    <ChevronRight size={16} className="text-gray-600" />
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-gray-600">
                                <Users size={32} className="mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No hay clientes que mostrar</p>
                            </div>
                        )}
                    </div>
                )}

                {/* SERVICIOS TAB */}
                {activeTab === 'servicios' && (
                    <div className="divide-y divide-white/5">
                        {services.map((service) => (
                            <div key={service.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-all">
                                <div 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${brand.colors.primary}20`, color: brand.colors.primary }}
                                >
                                    <Briefcase size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{service.name}</p>
                                    <p className="text-xs text-gray-500">{service.clients} clientes activos</p>
                                </div>
                                <span 
                                    className="text-[9px] font-bold uppercase px-2 py-1 rounded-full"
                                    style={{ 
                                        backgroundColor: service.status === 'active' ? `${brand.colors.success}15` : `${brand.colors.warning}15`,
                                        color: service.status === 'active' ? brand.colors.success : brand.colors.warning
                                    }}
                                >
                                    {service.status === 'active' ? 'Activo' : 'Setup'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* TAREAS TAB */}
                {activeTab === 'tareas' && (
                    <div className="divide-y divide-white/5">
                        {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-all">
                                <button 
                                    onClick={() => onToggleTask?.(task.id)}
                                    className="shrink-0 transition-transform active:scale-90"
                                >
                                    {task.completed ? (
                                        <div 
                                            className="w-5 h-5 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: brand.colors.success }}
                                        >
                                            <CheckSquare size={12} className="text-white" />
                                        </div>
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-600 hover:border-white/50 transition-colors" />
                                    )}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                        {task.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {task.assignedTo && (
                                            <span className="text-[9px] font-bold text-gray-500">{task.assignedTo}</span>
                                        )}
                                        {task.tags?.[0] && (
                                            <span className="text-[9px] text-gray-600">• {task.tags[0]}</span>
                                        )}
                                    </div>
                                </div>
                                <span 
                                    className="text-[9px] font-bold uppercase px-2 py-1 rounded-full"
                                    style={{ 
                                        backgroundColor: task.priority === 'high' ? `${brand.colors.danger}15` : 
                                                        task.priority === 'medium' ? `${brand.colors.warning}15` : `${brand.colors.muted}15`,
                                        color: task.priority === 'high' ? brand.colors.danger : 
                                               task.priority === 'medium' ? brand.colors.warning : brand.colors.muted
                                    }}
                                >
                                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                                </span>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-gray-600">
                                <CheckSquare size={32} className="mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No hay tareas que mostrar</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* NOTION LINK */}
            <div className="mt-4 flex justify-end">
                <a 
                    href="https://notion.so" 
                    target="_blank"
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-white transition-colors"
                >
                    <ExternalLink size={12} />
                    Abrir en Notion
                </a>
            </div>
        </div>
    );
};

export default NotionView;
