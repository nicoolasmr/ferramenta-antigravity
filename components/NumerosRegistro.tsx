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
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await supabase.from('metric_entries').upsert({
                user_id: session.user.id,
                metric_id: metricId,
                date: todayISO,
                payload: entry,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, metric_id, date' });
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
                        green: 'border-emerald-500/20',
                        yellow: 'border-amber-500/50',
                        red: 'border-red-500/50'
                    }[status || 'green'];

                    const bgStatus = {
                        green: '',
                        yellow: 'bg-amber-500/5',
                        red: 'bg-red-500/5'
                    }[status || 'green'];

                    return (
                        <Card key={metric.id} className={cn("transition-all", borderColor, bgStatus)}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-medium text-lg">{metric.name}</h3>
                                        <p className="text-xs text-muted-foreground">{metric.category} • {metric.unit}</p>
                                    </div>
                                    {entries[metric.id] !== '' && (
                                        <div className={cn("w-3 h-3 rounded-full mt-1.5", {
                                            'bg-emerald-500': status === 'green',
                                            'bg-amber-500 animate-pulse': status === 'yellow',
                                            'bg-red-500 animate-pulse': status === 'red',
                                        })} />
                                    )}
                                </div>

                                <div className="flex gap-2 items-center">
                                    <Input
                                        type="number"
                                        placeholder="Valor"
                                        className="text-lg h-12"
                                        value={entries[metric.id]}
                                        onChange={e => handleInputChange(metric, e.target.value)}
                                        onBlur={() => handleSave(metric.id)}
                                    />
                                    {lastSaved[metric.id] && (
                                        <div className="text-xs text-muted-foreground absolute bottom-3 right-6">
                                            Salvo {getRelativeTime(lastSaved[metric.id])}
                                        </div>
                                    )}
                                </div>
                                {status === 'red' && entries[metric.id] !== '' && (
                                    <div className="mt-3 flex items-start gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        <span>{metric.playbook.actionIfRed || 'Ação necessária!'}</span>
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
