import React, { useState } from 'react';
import { 
    LayoutGrid, Database, Zap, MessageSquare, 
    Settings, LogOut, ChevronLeft, ChevronRight,
    Home, Folder, BookOpen, User, ChevronsUpDown, Check
} from 'lucide-react';
import { ViewState, UserProfile } from '../types';
import { getCurrentBrand } from '../config/branding';

interface Organization {
    id: string;
    name: string;
    slug: string;
}

interface SidebarProps {
    activeView: ViewState;
    onNavigate: (view: ViewState) => void;
    user: UserProfile;
    onLogout: () => void;
    onOpenSettings?: () => void;
    // Multi-Org Props
    organizations: Organization[];
    currentOrgId: string;
    onSwitchOrg: (orgId: string) => void;
    // Mobile Props
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    activeView, onNavigate, user, onLogout, onOpenSettings,
    organizations, currentOrgId, onSwitchOrg, mobileOpen, onMobileClose
}) => {
    // Get brand based on current Org
    const brand = getCurrentBrand(currentOrgId);
    const [isCollapsed, setIsCollapsed] = useState(true); 
    const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);

    // Force expanded state on mobile when open
    const isExpanded = mobileOpen || !isCollapsed;

    const menuItems = [
        { id: 'home' as ViewState, label: 'Inicio', icon: <Home size={20} /> },
        { id: 'agency' as ViewState, label: 'Datos', icon: <Folder size={20} /> },
        { id: 'flow' as ViewState, label: 'RAG', icon: <BookOpen size={20} /> },
        { id: 'connections' as any, label: 'Conexiones', icon: <Zap size={20} /> },
        { id: 'team' as any, label: 'Equipo', icon: <User size={20} /> },
    ];

    return (
        <aside 
            className={`fixed left-0 top-0 bottom-0 ${mobileOpen ? 'flex w-64' : 'hidden md:flex'} flex-col z-[100] transition-all duration-300 ease-out bg-[#020203]/90 backdrop-blur-2xl border-r border-white/5 ${
                isCollapsed && !mobileOpen ? 'w-[72px]' : (!mobileOpen ? 'w-60' : '')
            }`}
        >
            {/* HEADER: ORG SWITCHER */}
            <div className="relative">
                <button 
                    onClick={() => !isExpanded && setIsOrgMenuOpen(!isOrgMenuOpen)}
                    className={`w-full p-3.5 flex items-center gap-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!isExpanded ? 'justify-center cursor-default' : 'justify-start cursor-pointer'}`}
                >
                    <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-purple-500/10"
                        style={{ background: `linear-gradient(135deg, ${brand.colors.primary}, ${brand.colors.accent})` }}
                    >
                        {brand.name.charAt(0)}
                    </div>
                    {isExpanded && (
                        <div className="flex-1 overflow-hidden text-left">
                            <h2 className="text-sm font-black tracking-tight text-white truncate">{brand.name}</h2>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider truncate">{brand.tagline}</p>
                        </div>
                    )}
                    {isExpanded && (
                        <ChevronsUpDown size={14} className="text-gray-500" />
                    )}
                </button>

                {/* ORG DROPDOWN */}
                {isOrgMenuOpen && isExpanded && (
                    <div className="absolute top-full left-2 right-2 mt-1 py-1 rounded-xl bg-[#0A0A0A] border border-white/10 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Organizaciones</div>
                        {organizations.map(org => (
                            <button
                                key={org.id}
                                onClick={() => {
                                    onSwitchOrg(org.id);
                                    setIsOrgMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white/5 transition-colors"
                            >
                                <div className={`w-4 h-4 rounded-full border border-white/20 flex items-center justify-center ${currentOrgId === org.id ? 'bg-white text-black' : 'text-transparent'}`}>
                                    {currentOrgId === org.id && <Check size={10} strokeWidth={4} />}
                                </div>
                                <span className={currentOrgId === org.id ? 'text-white font-semibold' : 'text-gray-400'}>
                                    {org.name}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* NAV ITEMS */}
            <nav className="flex-1 py-4 px-2 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        title={isCollapsed ? item.label : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                            activeView === item.id 
                                ? 'bg-white/10 text-white' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                        } ${!isExpanded ? 'justify-center' : 'justify-start'}`}
                    >
                        <div className={`shrink-0 transition-transform duration-200 ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                            {item.icon}
                        </div>
                        {isExpanded && (
                            <span className="text-sm font-semibold tracking-tight truncate group-active:scale-95 transition-transform hidden xs:inline">
                                {item.label}
                            </span>
                        )}
                        {isExpanded && activeView === item.id && (
                            <div 
                                className="ml-auto w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: brand.colors.primary, boxShadow: `0 0 8px ${brand.colors.primary}` }}
                            />
                        )}
                    </button>
                ))}
            </nav>

            {/* FOOTER: USER + ACTIONS */}
            <div className="p-3 border-t border-white/5 space-y-2">
                {/* USER CARD */}
                <button 
                    onClick={onOpenSettings}
                    className={`w-full p-1.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2 hover:bg-white/[0.06] transition-all ${!isExpanded ? 'justify-center' : 'justify-start'}`}
                >
                    <div className="w-8 h-8 rounded-lg bg-gray-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=${brand.colors.primary.slice(1)}&color=fff&size=64`} 
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {isExpanded && (
                        <div className="flex flex-col overflow-hidden text-left">
                            <span className="text-xs font-bold text-white truncate">{user.name}</span>
                            <span className="text-[9px] text-gray-500 truncate">{user.role}</span>
                        </div>
                    )}
                </button>

                {/* ACTIONS */}
                <div className={`flex ${!isExpanded ? 'flex-col' : ''} gap-1`}>
                    <button 
                        onClick={onOpenSettings}
                        title="Configuración"
                        className={`flex items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all ${!isExpanded ? 'w-full' : 'flex-1'}`}
                    >
                        <Settings size={16} />
                    </button>
                    <button 
                        onClick={onLogout}
                        title="Cerrar sesión"
                        className={`flex items-center justify-center p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all ${!isExpanded ? 'w-full' : 'flex-1'}`}
                    >
                        <LogOut size={16} />
                    </button>
                </div>

                {/* COLLAPSE TOGGLE */}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center p-2 rounded-xl text-gray-600 hover:text-white hover:bg-white/5 transition-all"
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    {!isCollapsed && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider">Colapsar</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
