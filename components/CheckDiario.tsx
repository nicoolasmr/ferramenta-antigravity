'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { storage, DailyCheck, OperationStatus, ContentStatus, CommercialAlignment, TomorrowTrend } from '@/lib/storage';
import { getTodayISO, getRelativeTime } from '@/lib/date-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BadgeStatus } from '@/components/ui/badge-status';
import { SegmentedControl, SegmentedControlList, SegmentedControlTrigger } from '@/components/ui/segmented-control';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function CheckDiario() {
    const supabase = createClient();
    const [check, setCheck] = useState<DailyCheck>({
        date: getTodayISO(),
        operationStatus: 'green',
        contentStatus: 'fulfilled',
        commercialAlignment: 'aligned',
        hasBottleneck: false,
        bottleneckDescription: '',
        tomorrowTrend: 'same',
    });

    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Load today's check
    useEffect(() => {
        const checks = storage.getDailyChecks();
        const todayCheck = checks.find(c => c.date === getTodayISO());
        if (todayCheck) {
            setCheck(todayCheck);
            setLastSaved(todayCheck.date);
        }
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        // Save local
        storage.saveDailyCheck(check);
        setLastSaved(new Date().toISOString());

        // Sync to Supabase if logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { error } = await supabase
                .from('daily_checks')
                .upsert({
                    user_id: session.user.id,
                    date: check.date,
                    payload: check,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, date' })

            if (error) console.error("Sync error:", error);
        }

        setTimeout(() => {
            setIsSaving(false);
        }, 800);
    };

    const isComplete = check.operationStatus && check.contentStatus && check.commercialAlignment && check.tomorrowTrend;

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-fade-in pb-24">
            {/* Header Area */}
            <div className="flex items-center justify-between px-2 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-primary/40 rounded-full" />
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Check Diário</h2>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Consciência Operacional</p>
                    </div>
                </div>
                <BadgeStatus
                    variant={lastSaved ? 'success' : 'outline'}
                    icon={lastSaved ? 'check' : 'clock'}
                    className="bg-slate-50 border-slate-100 text-slate-500"
                >
                    {lastSaved ? 'Sincronizado' : 'Aguardando'}
                </BadgeStatus>
            </div>

            {/* Questions Stack */}
            <div className="space-y-6">
                {/* 1. Operation */}
                <Card className="border-border bg-card shadow-sm ring-1 ring-border rounded-[2rem]">
                    <CardHeader className="pb-4 px-8 pt-8">
                        <CardTitle className="text-sm font-extrabold flex items-center gap-3 text-foreground">
                            <TrendingUp className="w-4 h-4 text-primary/60" />
                            Como está a operação hoje?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <SegmentedControl value={check.operationStatus} onValueChange={(v: string) => setCheck({ ...check, operationStatus: v as OperationStatus })}>
                            <SegmentedControlList className="bg-secondary p-1 border border-border h-12 rounded-2xl">
                                <SegmentedControlTrigger value="green" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">
                                    Sob controle
                                </SegmentedControlTrigger>
                                <SegmentedControlTrigger value="yellow" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm">
                                    Atenção
                                </SegmentedControlTrigger>
                                <SegmentedControlTrigger value="red" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm">
                                    Travando
                                </SegmentedControlTrigger>
                            </SegmentedControlList>
                        </SegmentedControl>
                    </CardContent>
                </Card>

                {/* 2. Content */}
                <Card className="border-border bg-card shadow-sm ring-1 ring-border rounded-[2rem]">
                    <CardHeader className="pb-4 px-8 pt-8">
                        <CardTitle className="text-sm font-extrabold flex items-center gap-3 text-foreground">
                            <CheckCircle2 className="w-4 h-4 text-primary/60" />
                            O conteúdo cumpriu seu papel?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <SegmentedControl value={check.contentStatus} onValueChange={(v: string) => setCheck({ ...check, contentStatus: v as ContentStatus })}>
                            <SegmentedControlList className="bg-slate-50 p-1 border border-slate-100 h-12 rounded-2xl">
                                <SegmentedControlTrigger value="fulfilled" className="rounded-xl data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">Sim</SegmentedControlTrigger>
                                <SegmentedControlTrigger value="at-risk" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Em risco</SegmentedControlTrigger>
                                <SegmentedControlTrigger value="not-priority" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Não prioridade</SegmentedControlTrigger>
                            </SegmentedControlList>
                        </SegmentedControl>
                    </CardContent>
                </Card>

                {/* 3. Commercial */}
                <Card className="border-border bg-card shadow-sm ring-1 ring-border rounded-[2rem]">
                    <CardHeader className="pb-4 px-8 pt-8">
                        <CardTitle className="text-sm font-extrabold flex items-center gap-3 text-foreground">
                            <DollarSign className="w-4 h-4 text-primary/60" />
                            O comercial está alinhado?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <SegmentedControl value={check.commercialAlignment} onValueChange={(v: string) => setCheck({ ...check, commercialAlignment: v as CommercialAlignment })}>
                            <SegmentedControlList className="bg-secondary p-1 border border-border h-12 rounded-2xl">
                                <SegmentedControlTrigger value="aligned" className="rounded-xl data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">Alinhado</SegmentedControlTrigger>
                                <SegmentedControlTrigger value="partial" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Parcial</SegmentedControlTrigger>
                                <SegmentedControlTrigger value="misaligned" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Não</SegmentedControlTrigger>
                            </SegmentedControlList>
                        </SegmentedControl>
                    </CardContent>
                </Card>

                {/* 4. Bottleneck */}
                <Card className={cn("border-border bg-card shadow-sm ring-1 ring-border rounded-[2rem] transition-all", check.hasBottleneck ? "ring-amber-200" : "")}>
                    <CardHeader className="py-6 px-8 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-extrabold flex items-center gap-3 text-foreground">
                            <AlertCircle className="w-4 h-4 text-primary/60" />
                            Existe gargalo visível?
                        </CardTitle>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCheck(prev => ({ ...prev, hasBottleneck: !prev.hasBottleneck }))}
                            className={cn("h-8 px-4 text-[10px] font-extrabold uppercase tracking-widest rounded-xl border transition-all", check.hasBottleneck ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-secondary text-muted-foreground border-border")}
                        >
                            {check.hasBottleneck ? "Remover" : "Adicionar"}
                        </Button>
                    </CardHeader>
                    {check.hasBottleneck && (
                        <CardContent className="animate-fade-in px-8 pb-8 pt-0">
                            <div className="space-y-3">
                                <textarea
                                    value={check.bottleneckDescription || ''}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 140) {
                                            setCheck({ ...check, bottleneckDescription: e.target.value });
                                        }
                                    }}
                                    placeholder="Descreva o que está travando o fluxo..."
                                    className="flex w-full rounded-[1.5rem] border border-border bg-secondary/50 px-5 py-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all min-h-[120px] resize-none text-foreground placeholder-muted-foreground"
                                />
                                <div className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    {(check.bottleneckDescription || '').length}/140
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* 5. Trend */}
                <Card className="border-border bg-card shadow-sm ring-1 ring-border rounded-[2rem]">
                    <CardHeader className="pb-4 px-8 pt-8">
                        <CardTitle className="text-sm font-extrabold flex items-center gap-3 text-foreground">
                            <TrendingUp className="w-4 h-4 text-primary/60" />
                            Tendência para amanhã
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <SegmentedControl value={check.tomorrowTrend} onValueChange={(v: string) => setCheck({ ...check, tomorrowTrend: v as TomorrowTrend })}>
                            <SegmentedControlList className="bg-secondary p-1 border border-border h-12 rounded-2xl">
                                <SegmentedControlTrigger value="better" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">Melhor ↗</SegmentedControlTrigger>
                                <SegmentedControlTrigger value="same" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-slate-600 data-[state=active]:shadow-sm">Igual →</SegmentedControlTrigger>
                                <SegmentedControlTrigger value="worse" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm">Pior ↘</SegmentedControlTrigger>
                            </SegmentedControlList>
                        </SegmentedControl>
                    </CardContent>
                </Card>
            </div>

            {/* Footer Action */}
            <div className="pt-8">
                <Button
                    size="lg"
                    className="w-full h-14 text-sm font-extrabold uppercase tracking-[0.2em] rounded-2xl shadow-lg bg-primary hover:bg-primary/90 text-white transition-all active:scale-[0.98]"
                    onClick={handleSave}
                    disabled={!isComplete || isSaving}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            Salvando
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-3" />
                            Finalizar Check Diário
                        </>
                    )}
                </Button>
                {lastSaved && (
                    <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest mt-6">
                        Atualizado {getRelativeTime(lastSaved)}
                    </p>
                )}
            </div>
        </div>
    );
}
