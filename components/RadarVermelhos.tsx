'use client';

import { useState, useEffect } from 'react';
import { AnchorMetric, MetricEntry, storage } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTodayISO } from '@/lib/date-utils';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export default function RadarVermelhos() {
    const supabase = createClient();
    const [redEntries, setRedEntries] = useState<{ metric: AnchorMetric, entry: MetricEntry }[]>([]);
    const [allGood, setAllGood] = useState(false);

    useEffect(() => {
        checkReds();
        // Poll every 5s to update if changed in registry
        const interval = setInterval(checkReds, 5000);
        return () => clearInterval(interval);
    }, []);

    const checkReds = () => {
        const metrics = storage.getAnchorMetrics().filter(m => m.isActive);
        const entries = storage.getMetricEntries();
        const todayISO = getTodayISO();

        const reds: { metric: AnchorMetric, entry: MetricEntry }[] = [];

        metrics.forEach(m => {
            const entry = entries.find(e => e.metricId === m.id && e.date === todayISO);
            if (entry && entry.status === 'red' && !entry.addressed) {
                reds.push({ metric: m, entry });
            }
        });

        setRedEntries(reds);
        setAllGood(reds.length === 0);
    };

    const markAsAddressed = async (metricId: string) => {
        const todayISO = getTodayISO();
        const entries = storage.getMetricEntries();
        const entryIndex = entries.findIndex(e => e.metricId === metricId && e.date === todayISO);

        if (entryIndex >= 0) {
            const updatedEntry = { ...entries[entryIndex], addressed: true, updatedAt: new Date().toISOString() };
            storage.saveMetricEntry(updatedEntry);

            // Sync
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await supabase.from('metric_entries').upsert({
                    user_id: session.user.id,
                    metric_id: metricId,
                    date: todayISO,
                    payload: updatedEntry,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, metric_id, date' });
            }

            checkReds(); // Refresh immediately
        }
    };

    if (allGood) {
        return (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 animate-fade-in mb-6">
                <div className="p-2 bg-emerald-500/20 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                    <h3 className="font-medium text-emerald-500">Radar Limpo</h3>
                    <p className="text-sm text-emerald-500/80">Nenhuma métrica crítica detectada hoje. Continue assim.</p>
                </div>
            </div>
        );
    }

    if (redEntries.length === 0) return null; // Should be handled by allGood, but safety check

    return (
        <Card className="border-red-500/50 bg-red-500/5 mb-8 animate-slide-in shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]">
            <CardHeader className="pb-2">
                <CardTitle className="text-red-500 flex items-center gap-2 text-lg">
                    <AlertTriangle className="w-5 h-5" />
                    Radar de Vermelhos ({redEntries.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {redEntries.map(({ metric, entry }) => (
                    <div key={metric.id} className="bg-background/80 backdrop-blur p-4 rounded-lg border border-red-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{metric.name}</span>
                                <span className="text-red-500 font-mono font-bold bg-red-100 dark:bg-red-900/30 px-2 rounded">
                                    {entry.value} {metric.unit}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold text-red-500">PLAYBOOK: </span>
                                {metric.playbook.actionIfRed || "Nenhuma ação definida no playbook."}
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="whitespace-nowrap"
                            onClick={() => markAsAddressed(metric.id)}
                        >
                            Marcar como Endereçado
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
