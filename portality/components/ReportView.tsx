import React from 'react';
import { FileChartColumn, TrendingUp, TrendingDown, DollarSign, Target, Users, Megaphone, Activity, AlertTriangle, CheckCircle2, Zap, ArrowRight, BrainCircuit } from 'lucide-react';

const ReportView: React.FC = () => {
  // Mock Data
  const metrics = {
    finance: [
      { label: 'Ingresos Totales', value: '$42,500', change: '+11.2%', sentiment: 'positive', sparkline: 'M0,20 L10,18 L20,15 L30,19 L40,10 L50,5 L60,8' },
      { label: 'MRR', value: '$15,800', change: '+11.3%', sentiment: 'positive', sparkline: 'M0,22 L15,20 L30,15 L45,12 L60,2' },
      { label: 'EBITDA', value: '$8,400', change: '+37.7%', sentiment: 'positive', sparkline: 'M0,25 L20,25 L40,15 L60,0' },
      { label: 'Burn Rate', value: '$12,000', change: '-11.1%', sentiment: 'positive', sparkline: 'M0,5 L15,10 L30,12 L45,18 L60,25' }, 
    ],
    sales: { goal: 60000, current: 42500, pipeline: 125000, winRate: 24, ticket: 1850 },
    marketing: { adSpend: 4500, cac: 250, roas: 4.2, leads: 340 },
    crm: { ltv: 4500, churn: 2.1, churnChange: '+0.4%', nps: 72 }
  };

  const getTrendStyles = (sentiment: string) => {
    if (sentiment === 'positive') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (sentiment === 'negative') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    return 'text-gray-400 bg-white/5 border-white/10';
  };

  const getTrendIcon = (changeStr: string) => {
      const isUp = changeStr.includes('+');
      return isUp ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />;
  };

  return (
    <div className="flex flex-col h-full px-6 pb-32">
        
        {/* Header */}
        <div className="flex flex-col gap-1 mb-8 pt-2 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0f1014] rounded-xl text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <FileChartColumn size={24} className="icon-duotone" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Intelligence 360°</h2>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Live Data • Oct 2023</p>
                    </div>
                </div>
            </div>
        </div>

        {/* 1. Executive Summary (Glassmorphism Card) */}
        <section className="mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-0">
            <div className="relative overflow-hidden rounded-[24px] border border-white/10 p-1 shadow-2xl group bg-gradient-to-b from-white/[0.03] to-transparent">
                
                {/* Background Engine */}
                <div className="absolute -right-8 -bottom-8 text-blue-500 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-700 pointer-events-none rotate-12">
                     <BrainCircuit size={200} strokeWidth={1} />
                </div>
                
                <div className="p-5 relative z-10">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <Activity size={14} className="text-blue-400" />
                            Diagnóstico IA
                        </h3>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Saludable A+</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-white/5 relative">
                            <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-emerald-500/50 rounded-r-full"></div>
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 size={14} className="text-emerald-500" />
                                <span className="text-xs font-bold text-gray-200">Logro Principal</span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed pl-1">
                                Récord histórico de <span className="text-white font-medium">EBITDA (+37%)</span> optimizando OpEx.
                            </p>
                         </div>
                         <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-white/5 relative">
                            <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-amber-500/50 rounded-r-full"></div>
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle size={14} className="text-amber-500" />
                                <span className="text-xs font-bold text-gray-200">Foco Requerido</span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed pl-1">
                                <span className="text-white font-medium">Win Rate (24%)</span> bajo objetivo. Revisar scripts.
                            </p>
                         </div>
                    </div>
                </div>
            </div>
        </section>

        {/* 2. Finanzas (Unified Dark Cards) */}
        <section className="mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2 px-1">
                <DollarSign size={14} /> Finanzas
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {metrics.finance.map((item, i) => (
                    <div key={i} className="group relative p-4 rounded-[20px] bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg overflow-hidden">
                        
                        {/* Sparkline Background */}
                        <svg className="absolute bottom-0 left-0 right-0 h-16 w-full opacity-10 pointer-events-none" preserveAspectRatio="none">
                            <path d={`M0,50 ${item.sparkline} L100,50 Z`} fill="url(#grad1)" stroke="none" />
                            <defs>
                                <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: item.sentiment === 'positive' ? '#10b981' : '#f43f5e', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: item.sentiment === 'positive' ? '#10b981' : '#f43f5e', stopOpacity: 0 }} />
                                </linearGradient>
                            </defs>
                        </svg>

                        <div className="relative z-10 flex flex-col h-full justify-between gap-3">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide truncate pr-2">{item.label}</span>
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-white tracking-tighter tabular-nums block">{item.value}</span>
                                <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold mt-1 border ${getTrendStyles(item.sentiment)}`}>
                                    {getTrendIcon(item.change)}
                                    {item.change}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* 3. Pipeline (Electric Dark Card) */}
        <section className="mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
             <div className="relative rounded-[24px] bg-[#080808] border border-white/10 p-6 overflow-hidden shadow-2xl group">
                {/* Engine */}
                <div className="absolute -right-8 -bottom-8 text-cyan-500 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
                     <Target size={180} strokeWidth={1} />
                </div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Target size={18} className="text-cyan-400" /> Pipeline & Ventas
                            </h3>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">Objetivo: ${(metrics.sales.goal / 1000).toFixed(0)}k</p>
                        </div>
                        <span className="text-2xl font-bold text-cyan-400 tracking-tight tabular-nums">
                            {Math.round((metrics.sales.current / metrics.sales.goal) * 100)}%
                        </span>
                    </div>

                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-6 relative">
                        <div 
                            className="h-full rounded-full bg-cyan-500 shadow-[0_0_15px_var(--cyan-500)] relative transition-all duration-1000 ease-out"
                            style={{ width: `${(metrics.sales.current / metrics.sales.goal) * 100}%` }}
                        ></div>
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-white/10">
                        <div className="pr-4">
                            <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider block mb-1">Pipeline</span>
                            <span className="text-sm font-bold text-white">${(metrics.sales.pipeline / 1000).toFixed(1)}k</span>
                        </div>
                        <div className="px-4 text-center">
                            <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider block mb-1">Win Rate</span>
                            <span className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1">
                                {metrics.sales.winRate}%
                            </span>
                        </div>
                        <div className="pl-4 text-right">
                            <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider block mb-1">Ticket</span>
                            <span className="text-sm font-bold text-white">${metrics.sales.ticket}</span>
                        </div>
                    </div>
                </div>
             </div>
        </section>

        {/* 4. Marketing & CRM (Compact Dark) */}
        <div className="grid grid-cols-1 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <div className="p-5 rounded-[20px] bg-[#0A0A0A] border border-white/5 flex flex-col gap-4 relative overflow-hidden group">
                {/* Engine */}
                <div className="absolute -right-5 -bottom-5 text-emerald-500 opacity-[0.03] group-hover:opacity-[0.08] pointer-events-none rotate-[-12deg]">
                     <Megaphone size={140} strokeWidth={1} />
                </div>

                <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-sm font-bold uppercase text-gray-400 flex items-center gap-2">
                        <Megaphone size={14} /> Marketing Mix
                    </h3>
                    <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-gray-300 border border-white/5">
                        Ads Spend: ${metrics.marketing.adSpend}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[9px] text-gray-500 uppercase font-bold">ROAS</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xl font-bold text-emerald-400">{metrics.marketing.roas}x</span>
                            <Zap size={14} className="text-emerald-500 fill-emerald-500" />
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[9px] text-gray-500 uppercase font-bold">CAC</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xl font-bold text-white">${metrics.marketing.cac}</span>
                        </div>
                    </div>
                </div>
            </div>

             <div className="p-5 rounded-[20px] bg-[#0A0A0A] border border-white/5 flex flex-col gap-4 relative overflow-hidden group">
                 {/* Engine */}
                <div className="absolute -right-5 -bottom-5 text-rose-500 opacity-[0.03] group-hover:opacity-[0.08] pointer-events-none">
                     <Users size={140} strokeWidth={1} />
                </div>

                 <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-sm font-bold uppercase text-gray-400 flex items-center gap-2">
                        <Users size={14} /> Salud Clientes
                    </h3>
                 </div>

                 <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 relative z-10">
                     <div className="flex flex-col">
                         <span className="text-[9px] text-rose-400 uppercase font-bold">Churn Rate</span>
                         <span className="text-lg font-bold text-white">{metrics.crm.churn}%</span>
                     </div>
                     <div className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded">
                         <TrendingUp size={12} />
                         {metrics.crm.churnChange}
                     </div>
                 </div>
                 
                 <div className="space-y-3 relative z-10 mt-1">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium text-xs">LTV Promedio</span>
                        <span className="text-white font-bold">${metrics.crm.ltv}</span>
                     </div>
                     <div className="w-full h-[1px] bg-white/5"></div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium text-xs">NPS Score</span>
                        <span className="text-blue-400 font-bold">{metrics.crm.nps}/100</span>
                     </div>
                 </div>
            </div>
        </div>

        {/* Action Plan */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
             <h3 className="text-sm font-bold uppercase text-gray-400 mb-4 flex items-center gap-2 px-1">
                <ArrowRight size={14} /> Plan de Acción
             </h3>
             <div className="flex flex-col gap-2">
                {[
                    { text: "Optimizar campaña de LinkedIn Ads", impact: "High" },
                    { text: "Implementar Sales Script V2", impact: "Crit" },
                    { text: "Lanzar programa de referidos", impact: "Med" }
                ].map((action, i) => (
                    <div key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 text-gray-400 flex items-center justify-center text-[10px] font-bold font-mono group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                {i + 1}
                            </span>
                            <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{action.text}</p>
                        </div>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                            action.impact === 'High' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' :
                            action.impact === 'Crit' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' :
                            'text-blue-400 border-blue-500/20 bg-blue-500/10'
                        }`}>
                            {action.impact}
                        </span>
                    </div>
                ))}
             </div>
        </section>

    </div>
  );
};

export default ReportView;