'use client';

import { useEffect, useState } from 'react';
import { storage, DailyCheck, MetricEntry, AnchorMetric } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Activity, Shield, TrendingUp, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

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
            if (s === 'green' || s === 'aligned' || s === 'fulfilled') return 'bg-emerald-500 text-emerald-50 border-emerald-500/20';
            if (s === 'yellow' || s === 'partial' || s === 'at-risk') return 'bg-amber-500 text-amber-50 border-amber-500/20';
            if (s === 'red' || s === 'misaligned' || s === 'not-priority') return 'bg-rose-500 text-rose-50 border-rose-500/20';
            return 'bg-slate-200 text-slate-400 border-slate-200/50'; // Default/Empty
        };

        return (
            <div className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all duration-500",
                getColor(status),
                status ? "shadow-lg scale-100" : "opacity-60 scale-95"
            )}>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <div className="text-[10px] uppercase font-bold opacity-80 tracking-wider transition-colors">{label}</div>
                    <div className="text-sm font-extrabold capitalize">{status ? status.replace('-', ' ') : 'Pendente'}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
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
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 animate-slide-in">
                        <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-rose-700 font-medium leading-relaxed">
                            <span className="font-bold block mb-0.5">Atenção Necessária:</span>
                            {dailyCheck.bottleneckDescription}
                        </p>
                    </div>
                )}
            </div>

            {/* Anchor Metrics Ticker */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Números Hoje</h3>
                </div>

                {metrics.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 border border-dashed border-slate-200 rounded-xl text-center">
                        <p className="text-xs text-slate-400 mb-2">Nenhum número configurado</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {metrics.map(metric => {
                            const entry = todaysEntries.find(e => e.metricId === metric.id);
                            return (
                                <div key={metric.id} className={cn(
                                    "p-3 rounded-lg border transition-all duration-300",
                                    entry ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50 border-transparent opacity-60"
                                )}>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase truncate mb-1">{metric.name}</div>
                                    <div className="flex items-end gap-1">
                                        <span className={cn(
                                            "text-xl font-black tabular-nums tracking-tight",
                                            !entry && "text-slate-300"
                                        )}>
                                            {entry ? entry.value : "-"}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium mb-1">{metric.unit}</span>
                                    </div>
                                    {entry && (
                                        <div className={cn(
                                            "mt-2 h-1 w-full rounded-full overflow-hidden bg-slate-100"
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
