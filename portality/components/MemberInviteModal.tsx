import React, { useState } from 'react';
import { X, Mail, Shield, ArrowRight, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    organizationId: string;
}

const MemberInviteModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, organizationId }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'member'>('member');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        try {
            // 1. Encontrar ID del usuario por Email en la tabla de perfiles
            const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email.toLowerCase().trim())
                .single();

            if (userError || !userData) {
                throw new Error('El usuario no está registrado en Portality. Invítalo primero a la plataforma.');
            }

            // 2. Insertar en la relación de miembros
            const { error: memberError } = await supabase
                .from('organization_members')
                .insert({
                    organization_id: organizationId,
                    user_id: userData.id,
                    role: role
                });

            if (memberError) {
                if (memberError.code === '23505') throw new Error('Este usuario ya es miembro de la organización.');
                throw memberError;
            }

            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setEmail('');
            }, 3000);
        } catch (err: any) {
            console.error('[Invite] Error:', err);
            setError(err.message || 'Error al enviar invitación');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-[#0a0a0b] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* HEADER */}
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <h2 className="text-xl font-black text-white tracking-tight">Invitar Compañero</h2>
                    <button onClick={onClose} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="p-8">
                    {isSuccess ? (
                        <div className="py-10 flex flex-col items-center text-center animate-in scale-in duration-500">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
                                <Check size={32} className="text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Invitación Enviada</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Hemos enviado un enlace de acceso a <br/>
                                <span className="text-white font-mono">{email}</span>
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleInvite} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email del Invitado</label>
                                <div className="relative group">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="compañero@organizacion.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nivel de Acceso</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setRole('member')}
                                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                                            role === 'member' ? 'bg-violet-500/10 border-violet-500/50 text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                                        }`}
                                    >
                                        <Mail size={16} />
                                        <span className="text-[10px] font-bold uppercase">Member</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setRole('admin')}
                                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                                            role === 'admin' ? 'bg-violet-500/10 border-violet-500/50 text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                                        }`}
                                    >
                                        <Shield size={16} />
                                        <span className="text-[10px] font-bold uppercase">Admin</span>
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-[11px] text-red-400 animate-in shake duration-300">
                                    <X size={14} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="pt-4">
                                <button 
                                    type="submit"
                                    disabled={isLoading || !email}
                                    className="w-full py-4 rounded-xl bg-violet-600 text-white font-black text-sm tracking-wide hover:bg-violet-500 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                                        <>
                                            Enviar Invitación
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-gray-600 text-center mt-4 uppercase tracking-tighter">
                                    Esta acción autorizará permanentemente al usuario en {organizationId}
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberInviteModal;
