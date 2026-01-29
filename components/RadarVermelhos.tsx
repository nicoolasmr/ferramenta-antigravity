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
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const { error } = await supabase.from('metric_entries').upsert({
                        user_id: session.user.id,
                        metric_id: metricId,
                        date: todayISO,
                        payload: updatedEntry,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id, metric_id, date' });

                    if (error) console.warn("Supabase sync (metric_entries) ignored:", error.message);
                }
            } catch (e) {
                console.warn("Supabase unavailable for metric_entries");
            }

            checkReds(); // Refresh immediately
        }
    };

    if (allGood) {
        return (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5 flex items-center gap-4 animate-fade-in mb-6 backdrop-blur-sm">
                <div className="p-2.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                    <h3 className="font-bold text-emerald-500 text-sm italic tracking-wide lowercase">Radar Limpo</h3>
                    <p className="text-xs text-muted-foreground font-medium">Nenhuma métrica crítica detectada hoje. Continue assim.</p>
                </div>
            </div>
        );
    }

    if (redEntries.length === 0) return null;

    return (
        <Card className="border-red-500/10 bg-red-950/10 mb-8 animate-slide-in shadow-[0_10px_40px_-15px_rgba(239,68,68,0.2)]">
            <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-red-500 flex items-center gap-2 text-lg font-bold tracking-tight">
                    <AlertTriangle className="w-5 h-5" />
                    Radar de Vermelhos ({redEntries.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {redEntries.map(({ metric, entry }) => (
                    <div key={metric.id} className="bg-card/40 backdrop-blur-xl p-5 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:bg-card/60">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-lg text-white">{metric.name}</span>
                                <span className="text-red-500 font-mono font-bold bg-red-500/10 px-3 py-1 rounded-full text-sm border border-red-500/20">
                                    {entry.value} {metric.unit}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                <span className="text-[10px] uppercase font-bold text-red-500 tracking-widest mr-2">Playbook:</span>
                                {metric.playbook.actionIfRed || "Nenhuma ação definida."}
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg font-bold transition-all"
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
