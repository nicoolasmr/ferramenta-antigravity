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

function RitualItem({ title, description, icon, status, actionLabel, onAction }: RitualCardProps) {
    return (
        <div className={cn(
            "flex items-center justify-between p-6 rounded-3xl border transition-all duration-300",
            status === 'done'
                ? "bg-emerald-500/10 border-emerald-500/20 opacity-80"
                : "bg-card border-border hover:border-primary/20 hover:shadow-md"
        )}>
            <div className="flex items-center gap-5">
                <div className={cn(
                    "p-3 rounded-2xl transition-colors",
                    status === 'done' ? "bg-emerald-500/20 text-emerald-500" : "bg-secondary text-muted-foreground"
                )}>
                    {icon}
                </div>
                <div>
                    <h4 className="font-extrabold text-foreground tracking-tight">{title}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{description}</p>
                </div>
            </div>

            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    "rounded-xl text-[10px] font-extrabold uppercase tracking-widest gap-2",
                    status === 'done' ? "text-emerald-600 hover:bg-emerald-50" : "text-primary hover:bg-primary/5"
                )}
                onClick={onAction}
            >
                {status === 'done' ? 'Concluído' : actionLabel}
                <ArrowRight className="w-3 h-3" />
            </Button>
        </div>
    );
}

export default function RitualHoje({ onNavigate }: { onNavigate: (tab: string) => void }) {
    const [morningDone, setMorningDone] = useState(false);
    const [afternoonStatus, setAfternoonStatus] = useState<'pending' | 'attention' | 'done'>('pending');
    const [eveningDone, setEveningDone] = useState(false);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const today = getTodayISO();
        const entries = storage.getEntriesForDate(today);
        setMorningDone(entries.length > 0);

        const metrics = storage.getAnchorMetrics();
        const entriesAll = storage.getMetricEntries();
        const reds = getRadarDeVermelhos(today, metrics, entriesAll);
        setAfternoonStatus(reds.length > 0 ? 'attention' : 'done');

        const checks = storage.getDailyChecks();
        setEveningDone(checks.some(c => c.date === today));

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
        <div className="space-y-4">
            <RitualItem
                title="Manhã"
                description="Registro de Métricas"
                icon={<Sun className="w-5 h-5" />}
                status={morningDone ? 'done' : 'pending'}
                actionLabel="Registrar"
                onAction={() => onNavigate('numeros')}
            />
            <RitualItem
                title="Meio do dia"
                description="Check de Radar"
                icon={<Ghost className={cn("w-5 h-5", afternoonStatus === 'attention' ? 'text-amber-500' : 'text-muted-foreground')} />}
                status={afternoonStatus}
                actionLabel="Ver Radar"
                onAction={() => onNavigate('numeros')}
            />
            <RitualItem
                title="O Rito"
                description="Consciência Diária"
                icon={<Moon className="w-5 h-5" />}
                status={eveningDone ? 'done' : 'pending'}
                actionLabel="Analisar"
                onAction={() => onNavigate('ritual')}
            />

            {/* Minimal Streak Indicator */}
            <div className="flex items-center gap-3 px-2 pt-4">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em]">Fluxo</span>
                <div className="flex gap-1.5">
                    {[...Array(7)].map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                i < streak ? "bg-primary shadow-sm" : "bg-muted"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
