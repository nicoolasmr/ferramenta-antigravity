'use client';

import { Sparkles, Target, Heart, Brain, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import RitualHoje from '@/components/RitualHoje';

interface DashboardViewProps {
    setActiveTab: (tab: string) => void;
    user?: any;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

export function DashboardView({ setActiveTab, user }: DashboardViewProps) {
    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Viajante';

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-auto"
        >
            {/* Hero Card - Spans 2 rows */}
            <motion.div variants={itemVariants} className="lg:col-span-7 lg:row-span-2 glass-card rounded-[2rem] p-10 group hover:scale-[1.01] transition-all duration-500 hover:shadow-glow-primary">
                <div className="mb-10 space-y-2">
                    <h2 className="text-4xl font-extrabold text-white tracking-tight title-glow">
                        Olá, {userName}
                    </h2>
                    <p className="text-lg text-slate-400 font-medium italic">
                        "Onde sua atenção flui, sua energia cresce."
                    </p>
                </div>

                <div className="space-y-10">
                    <div className="pt-8 border-t border-white/10">
                        <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-8">Estado de Fluxo</h3>

                        <div className="flex flex-wrap items-center gap-16">
                            {/* Animated Gauge */}
                            <motion.div
                                className="relative w-44 h-44 flex items-center justify-center"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <svg className="w-full h-full transform -rotate-90">
                                    <defs>
                                        <linearGradient id="gradient-cosmic" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="hsl(263 70% 65%)" />
                                            <stop offset="50%" stopColor="hsl(280 80% 55%)" />
                                            <stop offset="100%" stopColor="hsl(320 70% 60%)" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="88" cy="88" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                                    <motion.circle
                                        cx="88" cy="88" r="70"
                                        stroke="url(#gradient-cosmic)"
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={440}
                                        initial={{ strokeDashoffset: 440 }}
                                        animate={{ strokeDashoffset: 440 * (1 - 0.92) }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                                    />
                                    <circle cx="88" cy="88" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={376} strokeDashoffset={376 * (1 - 0.75)} className="text-amber-400/40" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Balance</span>
                                    <span className="text-4xl font-extrabold bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">92%</span>
                                </div>
                            </motion.div>

                            {/* Stats List */}
                            <div className="space-y-6">
                                {[
                                    { label: 'Energia:', val: 'Alta', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Sparkles },
                                    { label: 'Foco:', val: 'Estável', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: Target },
                                    { label: 'Bem-estar:', val: 'Excelente', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: Heart }
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex items-center gap-4 group/stat"
                                        whileHover={{ x: 4 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className={cn("p-3 rounded-xl border transition-all group-hover/stat:scale-110 group-hover/stat:shadow-glow-accent", stat.color)}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                                            <span className="text-sm font-extrabold text-white">{stat.val}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sessions Preview */}
                    <div className="pt-10 border-t border-white/10">
                        <div className="space-y-6">
                            <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Sessões Recomendadas</h3>
                            <div className="space-y-4">
                                {[
                                    { date: 'Hoje', title: 'Meditação Guiada', icon: Brain },
                                    { date: 'Amanhã', title: 'Workshop de Equilíbrio', icon: Zap }
                                ].map((session, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex items-center gap-4 p-4 rounded-2xl glass-subtle group/session hover:glass-card transition-all cursor-pointer"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className="p-3 bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-xl border border-primary/20">
                                            <session.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{session.date}</div>
                                            <span className="text-sm font-bold text-white">{session.title}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Ritual Progress Card */}
            <motion.div variants={itemVariants} className="lg:col-span-5 glass-card rounded-[2rem] p-8 hover:scale-[1.01] transition-all duration-500">
                <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-8">Compromisso de Hoje</h3>
                <RitualHoje onNavigate={setActiveTab} />
            </motion.div>

            {/* Activities Card */}
            <motion.div variants={itemVariants} className="lg:col-span-5 glass-card rounded-[2rem] p-8 hover:scale-[1.01] transition-all duration-500">
                <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-8">Atividades Recentes</h3>
                <div className="space-y-6">
                    {[
                        { label: 'Leitura Concluída:', val: 'A Arte do Fluxo', icon: Brain, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                        { label: 'Diário Atualizado:', val: 'Reflexão Matinal', icon: Sparkles, color: 'text-primary bg-primary/10 border-primary/20' }
                    ].map((activity, i) => (
                        <motion.div
                            key={i}
                            className="flex items-center gap-5 group/act"
                            whileHover={{ x: 4 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className={cn("p-3 rounded-2xl border transition-transform group-hover/act:scale-110", activity.color)}>
                                <activity.icon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-500 tracking-tight">{activity.label}</span>
                                <span className="text-sm font-extrabold text-white">{activity.val}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
