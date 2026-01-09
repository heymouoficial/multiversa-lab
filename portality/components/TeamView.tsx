import React, { useState, useEffect } from 'react';
import { 
    Users, UserPlus, Mail, Shield, 
    MoreHorizontal, Check, Clock, X,
    ArrowUpRight, Star, Heart
} from 'lucide-react';
import { getCurrentBrand } from '../config/branding';
import MemberInviteModal from './MemberInviteModal';
import { supabase } from '../lib/supabase';

interface Member {
    id: string;
    name: string;
    email: string;
    role: 'Owner' | 'Admin' | 'Member';
    status: 'active' | 'pending';
    avatar?: string;
}

const MemberSkeleton = () => (
    <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse">
        <div className="w-12 h-12 rounded-xl bg-white/5"></div>
        <div className="flex-1">
            <div className="w-32 h-4 bg-white/5 rounded mb-2"></div>
            <div className="w-48 h-3 bg-white/5 rounded"></div>
        </div>
        <div className="w-20 h-6 bg-white/5 rounded"></div>
    </div>
);

const TeamView: React.FC<{ organizationId: string }> = ({ organizationId }) => {
    const brand = getCurrentBrand();
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true);
            try {
                // Fetch members for this org
                // Note: organization_members usually links user_id to profiles(id)
                // We assume organization_members has: organization_id, user_id, role
                const { data, error } = await supabase
                    .from('organization_members')
                    .select(`
                        role,
                        profiles:user_id (
                            id,
                            full_name,
                            email,
                            role
                        )
                    `)
                    .eq('organization_id', organizationId);

                if (error) {
                    // Fallback or just empty if error (table might be empty or permissions issue)
                    console.error('Error loading team:', error);
                    setMembers([]);
                } else if (data) {
                    const mappedMembers = data.map((item: any) => ({
                        id: item.profiles?.id || 'unknown',
                        name: item.profiles?.full_name || 'Usuario',
                        email: item.profiles?.email || '',
                        role: (item.roles || 'Member') as 'Owner' | 'Admin' | 'Member', // Use org role preferably
                        status: 'active' as 'active' | 'pending',
                        avatar: item.profiles?.full_name?.charAt(0) || 'U'
                    }));
                    setMembers(mappedMembers);
                }
            } catch (err) {
                console.error('Failed to fetch members:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [organizationId]);

    // TODO: Implement Real Invitations Table
    const invitations: any[] = []; 

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Equipo</h1>
                    <p className="text-gray-500 text-sm">
                        Gestiona los accesos autorizados para <span className="text-white font-bold">{
                            // Try to find org name from members or passed prop? 
                            // Prop is ID, usually we want name. 
                            // Simplest: just ID for now or fetch Org Name (already done in parent usually)
                            organizationId.toUpperCase()
                        }</span>.
                    </p>
                </div>

                <button 
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-500 transition-all active:scale-95 shadow-lg shadow-violet-500/20"
                >
                    <UserPlus size={18} />
                    Invitar Socio
                </button>
            </div>

            {/* MEMBERS LIST */}
            <div className="space-y-6">
                <section>
                    <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Miembros Activos</h2>
                    <div className="grid gap-3">
                        {loading ? (
                            <>
                                <MemberSkeleton />
                                <MemberSkeleton />
                                <MemberSkeleton />
                            </>
                        ) : members.length > 0 ? (
                            members.map((member) => (
                                <div 
                                    key={member.id}
                                    className="group flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-300 font-black text-lg">
                                        {member.avatar || member.name.charAt(0)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-white truncate">{member.name}</h3>
                                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/5">
                                                <Shield size={10} className="text-gray-400" />
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{member.role}</span>
                                            </div>
                                        </div>
                                        <button className="p-2 rounded-lg text-gray-600 hover:text-white hover:bg-white/5 transition-all">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                                <Users className="mx-auto h-8 w-8 text-white/20 mb-3" />
                                <p className="text-sm text-gray-500">No hay miembros en esta organización.</p>
                            </div>
                        )}
                    </div>
                </section>

                {invitations.length > 0 && (
                    <section className="pt-4">
                        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Invitaciones Pendientes</h2>
                        <div className="grid gap-3">
                            {invitations.map((inv) => (
                                <div 
                                    key={inv.id}
                                    className="flex items-center gap-4 p-4 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center text-gray-600">
                                        <Mail size={20} />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-400 truncate">{inv.email}</h3>
                                        <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">Enviada {inv.sentAt}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors px-3 py-1">Reenviar</button>
                                        <button className="text-[10px] font-bold text-red-500/50 hover:text-red-500 transition-colors px-3 py-1">Cancelar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* QUOTA INFO */}
            <div className="mt-12 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-6">
                <div className="p-4 rounded-xl bg-violet-500/10 text-violet-400">
                    <Star size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white mb-1">Plan Closed Beta</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Actualmente puedes tener hasta **2 miembros** por organización. 
                        Contacta a Multiversa Lab para escalar tu equipo corporativo.
                    </p>
                </div>
            </div>

            <MemberInviteModal 
                isOpen={isInviteModalOpen} 
                onClose={() => setIsInviteModalOpen(false)} 
                organizationId={organizationId}
            />
        </div>
    );
};

export default TeamView;
