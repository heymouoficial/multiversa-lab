import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2, Radio } from 'lucide-react';
import { GeminiLiveService } from '../services/geminiLive';
import { ragService } from '../services/ragService';
import { AudioState } from '../types';

interface VoiceCoreProps {
  onStateChange: (state: AudioState) => void;
  onTaskCreate: (title: string, priority: 'high' | 'medium' | 'low') => Promise<any>;
  currentUserRole: string; // Needed for RAG segmentation
}

const VoiceCore: React.FC<VoiceCoreProps> = ({ onStateChange, onTaskCreate, currentUserRole }) => {
  const [audioState, setAudioState] = useState<AudioState>(AudioState.IDLE);
  const liveServiceRef = useRef<GeminiLiveService | null>(null);

  const toggleSession = async () => {
    if (audioState === AudioState.IDLE || audioState === AudioState.ERROR) {
      setAudioState(AudioState.CONNECTING);
      onStateChange(AudioState.CONNECTING);

      liveServiceRef.current = new GeminiLiveService({
        onStateChange: (connectionState: AudioState) => {
          if (connectionState === AudioState.LISTENING) {
            setAudioState(AudioState.LISTENING);
            onStateChange(AudioState.LISTENING);
          } else if (connectionState === AudioState.IDLE) {
            setAudioState(AudioState.IDLE);
            onStateChange(AudioState.IDLE);
          } else if (connectionState === AudioState.ERROR) {
            setAudioState(AudioState.ERROR);
            onStateChange(AudioState.ERROR);
          }
        },
        onAudioData: (isSpeaking) => {
          setAudioState(isSpeaking ? AudioState.SPEAKING : AudioState.LISTENING);
        },
        onToolCall: async (name, args) => {
            if (name === 'createTask') {
                const p = ['high', 'medium', 'low'].includes(args.priority) ? args.priority : 'medium';
                await onTaskCreate(args.title, p);
                return { result: "Task created successfully" };
            }
            if (name === 'queryKnowledgeBase') {
                const context = await ragService.retrieveContext(args.query, currentUserRole);
                return { result: context };
            }
            return { result: "Unknown tool" };
        }
      });
      
      await liveServiceRef.current.connect();

    } else {
      liveServiceRef.current?.disconnect();
      liveServiceRef.current = null;
      setAudioState(AudioState.IDLE);
      onStateChange(AudioState.IDLE);
    }
  };

  useEffect(() => {
    return () => {
      liveServiceRef.current?.disconnect();
    };
  }, []);

  // Volumetric Button Styles (Liquid 3D)
  const getButtonStyles = () => {
    switch (audioState) {
      case AudioState.CONNECTING: return 'bg-gray-800 border-white/10';
      case AudioState.LISTENING: return 'bg-[#4c1d95] border-violet-400/50 shadow-[0_0_50px_rgba(139,92,246,0.6),inset_0_-10px_20px_rgba(0,0,0,0.5),inset_0_10px_20px_rgba(255,255,255,0.4)]';
      case AudioState.SPEAKING: return 'bg-[#064e3b] border-emerald-400/50 shadow-[0_0_60px_rgba(16,185,129,0.7),inset_0_-10px_20px_rgba(0,0,0,0.5),inset_0_10px_20px_rgba(255,255,255,0.4)]';
      case AudioState.ERROR: return 'bg-red-900 border-red-500';
      case AudioState.IDLE: default: return 'bg-black border-white/10 shadow-[inset_0_10px_20px_rgba(255,255,255,0.1),0_10px_20px_rgba(0,0,0,0.5)]';
    }
  };

  return (
    <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-50">
      
      {/* Liquid Ambient Glow - Animated Blob behind */}
      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-[40px] transition-all duration-700 pointer-events-none ${
          audioState === AudioState.SPEAKING ? 'bg-emerald-500 opacity-60 scale-150 animate-pulse' : 
          audioState === AudioState.LISTENING ? 'bg-violet-600 opacity-50 scale-125' : 
          'bg-white opacity-5 scale-0'
      }`}></div>

      <button 
        onClick={toggleSession}
        className="relative w-20 h-20 rounded-full flex items-center justify-center group active:scale-95 transition-transform duration-200"
      >
        {/* Spinning Rings - Holographic Effect */}
        <div className={`absolute inset-[-4px] rounded-full border border-white/10 opacity-0 transition-opacity duration-700 ${
            audioState !== AudioState.IDLE ? 'animate-spin-slow opacity-100' : ''
        }`} style={{ borderStyle: 'dashed' }}></div>
        
        <div className={`absolute inset-[-8px] rounded-full border border-theme-primary/20 opacity-0 transition-opacity duration-700 ${
            audioState === AudioState.SPEAKING ? 'animate-spin opacity-100' : ''
        }`} style={{ borderStyle: 'dotted', animationDirection: 'reverse' }}></div>

        {/* 3D Orb Container */}
        <div className={`w-full h-full rounded-full border overflow-hidden flex items-center justify-center relative transition-all duration-500 ${getButtonStyles()}`}>
            
            {/* Top Gloss Reflection */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full pointer-events-none"></div>
            
            {/* Inner Liquid Animation */}
            <div className={`absolute inset-0 bg-gradient-to-tr from-theme-primary to-theme-secondary opacity-0 transition-opacity duration-500 blur-xl ${
                audioState === AudioState.SPEAKING ? 'opacity-80 animate-liquid' : ''
            }`}></div>

            {/* Listening Wave Ping */}
            {audioState === AudioState.LISTENING && <div className="absolute w-full h-full bg-violet-400 opacity-30 rounded-full animate-ping"></div>}
            
            {/* Icons */}
            <div className="relative z-20 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {audioState === AudioState.IDLE && <Mic size={26} strokeWidth={2} className="text-gray-300" />}
                {audioState === AudioState.CONNECTING && <Loader2 size={26} className="animate-spin text-gray-300" />}
                {audioState === AudioState.LISTENING && <Radio size={26} className="animate-pulse text-white" />}
                {audioState === AudioState.SPEAKING && (
                   <div className="flex gap-1 items-center h-6">
                     <div className="w-1.5 bg-white rounded-full animate-[bounce_0.8s_infinite] h-full"></div>
                     <div className="w-1.5 bg-white rounded-full animate-[bounce_1.0s_infinite] h-3/4"></div>
                     <div className="w-1.5 bg-white rounded-full animate-[bounce_1.2s_infinite] h-full"></div>
                   </div>
                )}
                {audioState === AudioState.ERROR && <Square size={24} />}
            </div>
        </div>
      </button>
      
      {/* Label Badge */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-32 text-center pointer-events-none">
        <span className={`text-[10px] uppercase font-black tracking-[0.25em] px-4 py-1.5 rounded-full backdrop-blur-xl border transition-all duration-300 shadow-lg ${
            audioState === AudioState.IDLE 
            ? 'text-gray-400 bg-black/60 border-white/10' 
            : 'text-white bg-theme-primary/20 border-theme-primary/30 shadow-[0_0_15px_var(--primary-dim)]'
        }`}>
            {audioState === AudioState.IDLE ? 'Aureon' : audioState}
        </span>
      </div>
    </div>
  );
};

export default VoiceCore;