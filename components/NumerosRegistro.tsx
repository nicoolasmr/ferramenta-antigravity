'use client';

import { useState, useEffect } from 'react';
import { AnchorMetric, MetricEntry, storage, MetricStatus } from '@/lib/storage';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BadgeStatus } from '@/components/ui/badge-status';
import { getTodayISO, getRelativeTime } from '@/lib/date-utils';
import { Save, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function NumerosRegistro() {
    const supabase = createClient();
    const [metrics, setMetrics] = useState<AnchorMetric[]>([]);
    const [entries, setEntries] = useState<Record<string, number | ''>>({}); // metricId -> value
    const [statuses, setStatuses] = useState<Record<string, MetricStatus>>({}); // metricId -> status
    const [lastSaved, setLastSaved] = useState<Record<string, string>>({}); // metricId -> ISODate
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const _metrics = storage.getAnchorMetrics().filter(m => m.isActive);
        setMetrics(_metrics);

        const _entries: Record<string, number | ''> = {};
        const _statuses: Record<string, MetricStatus> = {};
        const _lastSaved: Record<string, string> = {};

        const todayISO = getTodayISO();
        const allEntries = storage.getMetricEntries();

        _metrics.forEach(m => {
            // Find entry for today
            const todayEntry = allEntries.find(e => e.metricId === m.id && e.date === todayISO);
            if (todayEntry) {
                _entries[m.id] = todayEntry.value;
                _statuses[m.id] = todayEntry.status;
                _lastSaved[m.id] = todayEntry.updatedAt;
            } else {
                _entries[m.id] = '';
                _statuses[m.id] = 'green'; // Default visual
            }
        });

        setEntries(_entries);
        setStatuses(_statuses);
        setLastSaved(_lastSaved);
    };

    const calculateStatus = (metric: AnchorMetric, value: number): MetricStatus => {
        if (metric.direction === 'higher_better') {
            if (metric.guardrails.red.min !== undefined && value < metric.guardrails.red.min) return 'red';
            if (metric.guardrails.yellow.min !== undefined && value < metric.guardrails.yellow.min) return 'yellow';
            return 'green';
        } else {
            // lower_better
            if (metric.guardrails.red.max !== undefined && value > metric.guardrails.red.max) return 'red';
            if (metric.guardrails.yellow.max !== undefined && value > metric.guardrails.yellow.max) return 'yellow';
            return 'green';
        }
    };

    const handleInputChange = (metric: AnchorMetric, valStr: string) => {
        const val = valStr === '' ? '' : Number(valStr);
        setEntries(prev => ({ ...prev, [metric.id]: val }));

        if (val !== '') {
            const status = calculateStatus(metric, val as number);
            setStatuses(prev => ({ ...prev, [metric.id]: status }));
        }
    };

    const handleSave = async (metricId: string) => {
        const val = entries[metricId];
        if (val === '' || val === undefined) return;

        setIsSaving(true);
        const metric = metrics.find(m => m.id === metricId);
        if (!metric) return;

        const status = calculateStatus(metric, val as number);
        const todayISO = getTodayISO();

        const entry: MetricEntry = {
            metricId,
            date: todayISO,
            value: val as number,
            status,
            updatedAt: new Date().toISOString(),
            addressed: false // Reset addressed if value changes
        };

        // Save local
        storage.saveMetricEntry(entry);

        // Sync
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { error } = await supabase.from('metric_entries').upsert({
                    user_id: session.user.id,
                    metric_id: metricId,
                    date: todayISO,
                    payload: entry,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, metric_id, date' });

                if (error) console.warn("Supabase sync ignored (metric_entries):", error.message);
            }
        } catch (e) {
            console.warn("Supabase unavailable");
        }

        setLastSaved(prev => ({ ...prev, [metricId]: new Date().toISOString() }));
        setStatuses(prev => ({ ...prev, [metricId]: status }));
        setTimeout(() => setIsSaving(false), 500);
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.map(metric => {
                    const status = statuses[metric.id];
                    const borderColor = {
                        green: 'border-border',
                        yellow: 'border-amber-500/20',
                        red: 'border-destructive/20'
                    }[status || 'green'];

                    const bgStatus = {
                        green: 'bg-card',
                        yellow: 'bg-amber-500/5',
                        red: 'bg-destructive/5'
                    }[status || 'green'];

                    return (
                        <Card key={metric.id} className={cn("transition-all shadow-sm relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 rounded-[2.5rem]", borderColor, bgStatus)}>
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <h3 className="font-extrabold text-xl text-foreground group-hover:text-primary transition-colors">{metric.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider font-sans">{metric.category}</span>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider font-sans">{metric.unit}</span>
                                        </div>
                                    </div>
                                    {entries[metric.id] !== '' && (
                                        <div className={cn("w-3 h-3 rounded-full mt-2 ring-4", {
                                            'bg-emerald-500 ring-emerald-500/10': status === 'green',
                                            'bg-amber-500 ring-amber-500/10 animate-pulse': status === 'yellow',
                                            'bg-red-500 ring-red-500/10 animate-pulse': status === 'red',
                                        })} />
                                    )}
                                </div>

                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="text-3xl font-extrabold h-20 bg-secondary border-border rounded-3xl px-6 focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all placeholder:text-muted-foreground/30 text-foreground"
                                        value={entries[metric.id]}
                                        onChange={e => handleInputChange(metric, e.target.value)}
                                        onBlur={() => handleSave(metric.id)}
                                    />
                                    {lastSaved[metric.id] && (
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest absolute top-[-25px] right-2 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                            Salvo {getRelativeTime(lastSaved[metric.id])}
                                        </div>
                                    )}
                                </div>

                                {status === 'red' && entries[metric.id] !== '' && (
                                    <div className="mt-6 flex items-start gap-4 text-xs text-destructive bg-destructive/10 p-4 rounded-2xl border border-destructive/20 animate-in slide-in-from-top-2 duration-300">
                                        <AlertTriangle className="w-5 h-5 shrink-0 text-destructive" />
                                        <div className="space-y-1">
                                            <p className="font-extrabold uppercase tracking-tight">Ação Necessária</p>
                                            <p className="font-medium opacity-80">{metric.playbook.actionIfRed || 'Ação imediata recomendada!'}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            {metrics.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    Configure suas métricas na aba "Configuração" para começar.
                </div>
            )}
        </div>
    );
}
