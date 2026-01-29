'use client';

import { Sparkles, Target, Heart, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import RitualHoje from '@/components/RitualHoje';

interface DashboardViewProps {
    setActiveTab: (tab: string) => void;
    user?: any;
}

export function DashboardView({ setActiveTab, user }: DashboardViewProps) {
    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Viajante';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Personal Dashboard */}
            <div className="lg:col-span-7 space-y-12">
                <div className="bg-slate-50/30 rounded-[2rem] p-10 border border-slate-100 group hover:border-primary/20 transition-all duration-500">
                    <div className="mb-10 space-y-2">
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Olá, {userName},
                        </h2>
                        <p className="text-lg text-slate-500 font-medium italic">
                            "Onde sua atenção flui, sua energia cresce."
                        </p>
                    </div>

                    <div className="space-y-10">
                        <div className="pt-8 border-t border-slate-200/50">
                            <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] mb-8">Estado de Fluxo</h3>

                            <div className="flex flex-wrap items-center gap-16">
                                {/* Dashboard Gauge (92%) */}
                                <div className="relative w-44 h-44 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="88" cy="88" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                                        <circle cx="88" cy="88" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 * (1 - 0.92)} className="text-primary/40" />
                                        <circle cx="88" cy="88" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={376} strokeDashoffset={376 * (1 - 0.75)} className="text-amber-200/60" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Balance</span>
                                        <span className="text-3xl font-extrabold text-slate-800">92%</span>
                                    </div>
                                </div>

                                {/* Stats List */}
                                <div className="space-y-6">
                                    {[
                                        { label: 'Energia:', val: 'Alta', color: 'bg-amber-100 text-amber-600', icon: Sparkles },
                                        { label: 'Foco:', val: 'Estável', color: 'bg-blue-50 text-blue-500', icon: Target },
                                        { label: 'Bem-estar:', val: 'Excelente', color: 'bg-rose-50 text-rose-500', icon: Heart }
                                    ].map((stat, i) => (
                                        <div key={i} className="flex items-center gap-4 group/stat">
                                            <div className={cn("p-2 rounded-xl transition-all group-hover/stat:scale-110", stat.color)}>
                                                <stat.icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                                                <span className="text-sm font-extrabold text-slate-700">{stat.val}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sessions Preview */}
                        <div className="pt-10 border-t border-slate-200/50">
                            <div className="space-y-6">
                                <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Sessões Recomendadas</h3>
                                <div className="space-y-4">
                                    {[
                                        { date: 'Hoje', title: 'Meditação Guiada' },
                                        { date: 'Amanhã', title: 'Workshop de Equilíbrio' }
                                    ].map((session, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100/50 group/session hover:border-primary/30 transition-all">
                                            <div className="p-2 bg-purple-50 rounded-xl text-primary font-bold text-xs">
                                                {session.date}
                                            </div>
                                            <span className="text-sm font-bold text-slate-600">{session.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Ritual Progress */}
            <div className="lg:col-span-5 space-y-10">
                <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100">
                    <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] mb-8">Compromisso de Hoje</h3>
                    <RitualHoje onNavigate={setActiveTab} />
                </div>

                <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100">
                    <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] mb-8">Atividades Recentes</h3>
                    <div className="space-y-8">
                        {[
                            { label: 'Leitura Concluída:', val: 'A Arte do Fluxo', icon: Brain, color: 'text-amber-600 bg-amber-50' },
                            { label: 'Diário Atualizado:', val: 'Reflexão Matinal', icon: Sparkles, color: 'text-purple-600 bg-purple-50' }
                        ].map((activity, i) => (
                            <div key={i} className="flex items-center gap-5 group/act">
                                <div className={cn("p-3 rounded-2xl transition-transform group-hover/act:scale-110", activity.color)}>
                                    <activity.icon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-400 tracking-tight">{activity.label}</span>
                                    <span className="text-sm font-extrabold text-slate-800">{activity.val}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
