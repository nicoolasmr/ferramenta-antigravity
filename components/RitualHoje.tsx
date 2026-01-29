'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ArrowRight, Sun, Ghost, Moon, AlertTriangle } from 'lucide-react';
import { storage } from '@/lib/storage';
import { getTodayISO } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import { getRadarDeVermelhos } from '@/lib/metrics-engine';

interface RitualCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    status: 'done' | 'pending' | 'attention';
    actionLabel: string;
    onAction: () => void;
}

function RitualCard({ title, description, icon, status, actionLabel, onAction }: RitualCardProps) {
    return (
        <Card className={cn(
            "border-border/50 transition-all hover:border-primary/30 group",
            status === 'done' ? "bg-emerald-500/5 opacity-80" : "bg-secondary/20 shadow-lg"
        )}>
            <CardContent className="p-4 flex flex-col h-full justify-between gap-4">
                <div className="flex items-start justify-between">
                    <div className={cn(
                        "p-2 rounded-lg",
                        status === 'done' ? "bg-emerald-500/20" : "bg-primary/20"
                    )}>
                        {icon}
                    </div>
                    {status === 'done' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : status === 'attention' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                    ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/30" />
                    )}
                </div>

                <div>
                    <h3 className="font-bold text-lg">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>

                <Button
                    variant={status === 'done' ? "ghost" : "default"}
                    size="sm"
                    className="w-full justify-between group"
                    onClick={onAction}
                >
                    {actionLabel}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </CardContent>
        </Card>
    );
}

export default function RitualHoje({ onNavigate }: { onNavigate: (tab: string) => void }) {
    const [morningDone, setMorningDone] = useState(false);
    const [afternoonStatus, setAfternoonStatus] = useState<'pending' | 'attention' | 'done'>('pending');
    const [eveningDone, setEveningDone] = useState(false);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const today = getTodayISO();

        // Morning Status: Any metric entry today?
        const entries = storage.getEntriesForDate(today);
        setMorningDone(entries.length > 0);

        // Afternoon Status: Any red alerts in radar?
        const metrics = storage.getAnchorMetrics();
        const entriesAll = storage.getMetricEntries();
        const reds = getRadarDeVermelhos(today, metrics, entriesAll);
        setAfternoonStatus(reds.length > 0 ? 'attention' : 'done');

        // Evening Status: Daily check done today?
        const checks = storage.getDailyChecks();
        setEveningDone(checks.some(c => c.date === today));

        // Streak logic (last 7 days)
        let count = 0;
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const iso = date.toISOString().split('T')[0];
            if (checks.some(c => c.date === iso)) count++;
        }
        setStreak(count);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Ritual de Hoje</h2>
                    <p className="text-muted-foreground text-sm italic">"Constância alimenta a alma."</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Dias de Clareza</span>
                    <div className="flex gap-1 mt-1">
                        {[...Array(7)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-3 h-1.5 rounded-full",
                                    i < streak ? "bg-primary" : "bg-muted"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RitualCard
                    title="Manhã"
                    description="Atualize seus Números Âncora"
                    icon={<Sun className="w-5 h-5 text-primary" />}
                    status={morningDone ? 'done' : 'pending'}
                    actionLabel={morningDone ? "Ver Números" : "Registrar"}
                    onAction={() => onNavigate('numeros')}
                />
                <RitualCard
                    title="Meio do dia"
                    description="Veja o Radar de Vermelhos"
                    icon={<Ghost className="w-5 h-5 text-amber-500" />}
                    status={afternoonStatus}
                    actionLabel="Ver Radar"
                    onAction={() => onNavigate('numeros')}
                />
                <RitualCard
                    title="Fim do dia"
                    description="Faça o Check Diário"
                    icon={<Moon className="w-5 h-5 text-blue-500" />}
                    status={eveningDone ? 'done' : 'pending'}
                    actionLabel={eveningDone ? "Ver Check" : "Fazer Agora"}
                    onAction={() => onNavigate('check')}
                />
            </div>
        </div>
    );
}
