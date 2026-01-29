'use client';

import { useEffect, useState } from 'react';
import { storage, DailyCheck, MetricEntry, AnchorMetric } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Activity, Shield, TrendingUp, Users, AlertCircle, Plus } from 'lucide-react';

const STATUS_TRANSLATIONS: Record<string, string> = {
    'green': 'Verde',
    'yellow': 'Atenção',
    'red': 'Crítico',
    'fulfilled': 'Realizado',
    'at-risk': 'Em Risco',
    'not-priority': 'Não Prioritário',
    'aligned': 'Alinhado',
    'partial': 'Parcial',
    'misaligned': 'Desalinhado'
};

export default function LiveStatus() {
    const [dailyCheck, setDailyCheck] = useState<DailyCheck | null>(null);
    const [metrics, setMetrics] = useState<AnchorMetric[]>([]);
    const [todaysEntries, setTodaysEntries] = useState<MetricEntry[]>([]);
    const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

    // Load data
    const refreshData = () => {
        const today = new Date().toISOString().split('T')[0];
        const allChecks = storage.getDailyChecks();
        const check = allChecks.find(c => c.date === today) || null;

        const allMetrics = storage.getAnchorMetrics();
        const activeMetrics = allMetrics.filter(m => m.isActive);
        const allEntries = storage.getMetricEntries();
        const todayEntries = allEntries.filter(e => e.date === today);

        setDailyCheck(check);
        setMetrics(activeMetrics);
        setTodaysEntries(todayEntries);
        setLastUpdate(Date.now());
    };

    useEffect(() => {
        refreshData();

        // Listen for storage events (triggered by AIChat)
        const handleStorageChange = () => {
            console.log('LiveStatus: Storage update detected');
            refreshData();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Helper for traffic light indicators
    const StatusLight = ({ status, label, icon: Icon }: { status?: string, label: string, icon: any }) => {
        const getColor = (s?: string) => {
            if (s === 'green' || s === 'aligned' || s === 'fulfilled') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
            if (s === 'yellow' || s === 'partial' || s === 'at-risk') return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
            if (s === 'red' || s === 'misaligned' || s === 'not-priority') return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
            return 'bg-white/5 text-slate-500 border-white/5'; // Default/Empty
        };

        const translatedStatus = status ? (STATUS_TRANSLATIONS[status] || status) : 'Pendente';

        return (
            <div className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all duration-500 glass-subtle",
                status === 'green' || status === 'aligned' || status === 'fulfilled' ? "border-emerald-500/30 shadow-glow-success" : "",
                status === 'yellow' || status === 'partial' || status === 'at-risk' ? "border-amber-500/30 shadow-glow-warning" : "",
                status === 'red' || status === 'misaligned' || status === 'not-priority' ? "border-rose-500/30 shadow-glow-danger animate-pulse-glow" : "",
                !status ? "opacity-60 scale-95" : "scale-100"
            )}>
                <div className="p-2 glass-subtle rounded-lg">
                    <Icon className={cn(
                        "w-4 h-4",
                        status === 'green' || status === 'aligned' || status === 'fulfilled' ? "text-emerald-400" : "",
                        status === 'yellow' || status === 'partial' || status === 'at-risk' ? "text-amber-400" : "",
                        status === 'red' || status === 'misaligned' || status === 'not-priority' ? "text-rose-400" : "text-slate-500"
                    )} />
                </div>
                <div>
                    <div className="text-[10px] uppercase font-bold opacity-80 tracking-wider transition-colors">{label}</div>
                    <div className="text-sm font-extrabold capitalize">{translatedStatus}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in group h-full">
            {/* Daily Check Status */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sinais do Dia</h3>
                </div>
                <div className="flex flex-col gap-3">
                    <StatusLight
                        status={dailyCheck?.operationStatus}
                        label="Operação"
                        icon={Shield}
                    />
                    <StatusLight
                        status={dailyCheck?.contentStatus}
                        label="Conteúdo"
                        icon={TrendingUp}
                    />
                    <StatusLight
                        status={dailyCheck?.commercialAlignment}
                        label="Comercial"
                        icon={Users}
                    />
                </div>
                {dailyCheck?.hasBottleneck && (
                    <div className="p-3 glass-subtle border border-rose-500/30 rounded-xl flex items-start gap-3 animate-slide-in shadow-glow-danger">
                        <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-rose-400 font-medium leading-relaxed">
                            <span className="font-bold block mb-0.5 text-rose-300">Atenção Necessária:</span>
                            {dailyCheck.bottleneckDescription}
                        </p>
                    </div>
                )}
            </div>

            {/* Anchor Metrics Ticker */}
            <div className="flex flex-col space-y-4 h-full">
                <div className="flex items-center gap-2 mb-2 shrink-0">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Números Hoje</h3>
                </div>

                {metrics.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-white/10 bg-white/5 rounded-xl text-center group/empty transition-colors hover:border-primary/20 hover:bg-primary/5 cursor-pointer">
                        <div className="p-3 bg-white/5 rounded-full mb-3 group-hover/empty:scale-110 transition-transform">
                            <Plus className="w-5 h-5 text-slate-600 group-hover/empty:text-primary transition-colors" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium group-hover/empty:text-primary/80 transition-colors">Configurar Números</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {metrics.map(metric => {
                            const entry = todaysEntries.find(e => e.metricId === metric.id);
                            return (
                                <div key={metric.id} className={cn(
                                    "p-3 rounded-lg border transition-all duration-300",
                                    entry ? "glass-card border-white/10 shadow-lg" : "glass-subtle border-transparent opacity-60"
                                )}>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase truncate mb-1">{metric.name}</div>
                                    <div className="flex items-end gap-1">
                                        <span className={cn(
                                            "text-xl font-black tabular-nums tracking-tight",
                                            !entry ? "text-slate-600" : "text-white"
                                        )}>
                                            {entry ? entry.value : "-"}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-medium mb-1">{metric.unit}</span>
                                    </div>
                                    {entry && (
                                        <div className={cn(
                                            "mt-2 h-1 w-full rounded-full overflow-hidden bg-black/20"
                                        )}>
                                            <div className={cn(
                                                "h-full w-full",
                                                entry.status === 'green' && "bg-emerald-500",
                                                entry.status === 'yellow' && "bg-amber-500",
                                                entry.status === 'red' && "bg-rose-500",
                                            )} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
