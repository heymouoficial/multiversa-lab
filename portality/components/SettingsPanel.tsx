import React from 'react';
import { Sun, Moon, Monitor, X, Users } from 'lucide-react';
import { THEMES } from '../constants';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  currentColor: string;
  onColorChange: (colorKey: string) => void;
  currentProfileId: string;
  onProfileChange: (id: string) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, onClose, currentTheme, onThemeChange, currentColor, onColorChange, currentProfileId, onProfileChange
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 backdrop-blur-sm ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      
      {/* Panel */}
      <div className={`fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-white/10 rounded-t-[30px] z-[70] transition-transform duration-300 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
        
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Configuración Aureon</h3>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <X size={18} />
            </button>
        </div>

        {/* Profile Switcher (Simulation) */}
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-theme-primary" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Perfil Activo</span>
            </div>
            <div className="flex p-1 bg-black rounded-xl border border-white/10">
                {[
                    { id: 'andrea', label: 'Andrea' },
                    { id: 'christian', label: 'Christian' },
                    { id: 'moises', label: 'Moisés' }
                ].map((profile) => (
                    <button 
                        key={profile.id}
                        onClick={() => onProfileChange(profile.id)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-center gap-2 ${currentProfileId === profile.id ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/5' : 'text-gray-500 hover:bg-white/5'}`}
                    >
                        {profile.label}
                    </button>
                ))}
            </div>
        </div>
        
        {/* Theme Toggle */}
        <div className="mb-8">
            <span className="text-xs font-bold text-gray-500 mb-3 block uppercase tracking-wider">Apariencia</span>
            <div className="flex p-1 bg-black rounded-xl border border-white/10">
                {(['light', 'dark', 'system'] as const).map((mode) => (
                    <button 
                        key={mode}
                        onClick={() => onThemeChange(mode)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-center gap-2 ${currentTheme === mode ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:bg-white/5'}`}
                    >
                        {mode === 'light' && <Sun size={16} />}
                        {mode === 'dark' && <Moon size={16} />}
                        {mode === 'system' && <Monitor size={16} />}
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                ))}
            </div>
        </div>

        {/* Color Accents */}
        <div className="mb-4">
            <span className="text-xs font-bold text-gray-500 mb-3 block uppercase tracking-wider">Acento Visual</span>
            <div className="grid grid-cols-4 gap-3">
                {Object.keys(THEMES).map((key) => (
                    <button 
                        key={key}
                        onClick={() => onColorChange(key)}
                        style={{ backgroundColor: THEMES[key].primary }}
                        className={`h-12 rounded-full border-2 border-transparent hover:scale-105 active:scale-95 transition-transform relative ring-offset-2 ring-offset-[#0A0A0A] focus:ring-2 ${currentColor === key ? 'ring-2 ring-white' : ''}`}
                    />
                ))}
            </div>
        </div>
      </div>
    </>
  );
};