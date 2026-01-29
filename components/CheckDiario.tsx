'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { storage, DailyCheck, OperationStatus, ContentStatus, CommercialAlignment, TomorrowTrend } from '@/lib/storage';
import { getTodayISO, getRelativeTime } from '@/lib/date-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function CheckDiario() {
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    const [check, setCheck] = useState<DailyCheck>({
        date: getTodayISO(),
        operationStatus: 'smooth',
        operationBlocker: '',
        contentStatus: 'posted',
        contentMissedReason: '',
        commercialAlignment: 'aligned',
        commercialGap: '',
        tomorrowTrend: 'better',
        dailyWin: '',
        user_id: ''
    });

    useEffect(() => {
        loadDailyCheck();
    }, []);

    const loadDailyCheck = async () => {
        setIsLoading(true);
        const today = getTodayISO();

        // 1. Try local storage first
        const localData = storage.getDailyCheck(today);
        if (localData) {
            setCheck(localData);
            setLastSaved(localData.updatedAt || null);
            setIsLoading(false);
        }

        // 2. Try Supabase (if authenticated) - simplified for now
        // In a real scenario, we'd merge or fetch latest
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const updatedCheck = {
            ...check,
            updatedAt: new Date().toISOString()
        };

        // 1. Save Local
        storage.saveDailyCheck(updatedCheck);

        // 2. Sync Supabase
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await supabase.from('daily_checks').upsert({
                    user_id: session.user.id,
                    date: check.date,
                    payload: updatedCheck,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, date' });
            }
        } catch (e) {
            console.error("Sync error", e);
        }

        setLastSaved(new Date().toISOString());
        setTimeout(() => setIsSaving(false), 800);
    };

    const updateField = (field: keyof DailyCheck, value: any) => {
        setCheck(prev => ({ ...prev, [field]: value }));
    };

    const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
        <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-full bg-white/10 text-primary">
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-white">{title}</h3>
        </div>
    );

    // Helper for toggle items to ensure consistent styling
    const ToggleItem = ({ value, label, colorClass }: { value: string, label: string, colorClass: string }) => (
        <ToggleGroupItem
            value={value}
            className={cn(
                "flex-1 border border-white/5 data-[state=on]:bg-white/10 transition-all hover:bg-white/5 text-slate-400 data-[state=on]:text-white",
                check.operationStatus === value && colorClass // Apply specific color glow if selected? Or just keep simple white/primary
            )}
        >
            {label}
        </ToggleGroupItem>
    );

    if (isLoading) return <div className="p-12 text-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />Carregando...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-1">

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Check-in Diário</h2>
                    <p className="text-slate-400 mt-1">Registre o pulso do negócio hoje.</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Button
                        size="lg"
                        onClick={handleSave}
                        disabled={isSaving}
                        className={cn(
                            "group font-bold transition-all duration-500",
                            isSaving ? "w-[140px] bg-emerald-500/20 text-emerald-500" : "w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/20"
                        )}
                    >
                        {isSaving ? (
                            <>
                                <CheckCircle2 className="w-5 h-5 mr-2 animate-bounce" />
                                Salvo!
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                Salvar
                            </>
                        )}
                    </Button>
                    {lastSaved && <span className="text-xs text-slate-500 font-medium">Última sync: {getRelativeTime(lastSaved)}</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Operação */}
                <Card className="bg-black/20 border-white/5 backdrop-blur-sm shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/30" />
                    <CardHeader>
                        <SectionHeader icon={AlertCircle} title="Operação" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Label className="text-slate-300">Como fluiu a operação hoje?</Label>
                        <ToggleGroup type="single" value={check.operationStatus} onValueChange={(v) => v && updateField('operationStatus', v)} className="bg-black/40 p-1 rounded-lg border border-white/5">
                            <ToggleGroupItem value="smooth" className="flex-1 data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400 text-slate-400 hover:text-slate-200 transaction-all">Liso 🟢</ToggleGroupItem>
                            <ToggleGroupItem value="friction" className="flex-1 data-[state=on]:bg-amber-500/20 data-[state=on]:text-amber-400 text-slate-400 hover:text-slate-200 transaction-all">Atrito 🟡</ToggleGroupItem>
                            <ToggleGroupItem value="chaos" className="flex-1 data-[state=on]:bg-rose-500/20 data-[state=on]:text-rose-400 text-slate-400 hover:text-slate-200 transaction-all">Caos 🔴</ToggleGroupItem>
                        </ToggleGroup>

                        {(check.operationStatus === 'friction' || check.operationStatus === 'chaos') && (
                            <div className="animate-in slide-in-from-top-2">
                                <Label className="text-rose-400 mb-2 block">O que travou?</Label>
                                <Textarea
                                    placeholder="Descreva o gargalo..."
                                    className="bg-black/40 border-rose-500/30 focus:border-rose-500 text-white min-h-[80px]"
                                    value={check.operationBlocker}
                                    onChange={e => updateField('operationBlocker', e.target.value)}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Conteúdo */}
                <Card className="bg-black/20 border-white/5 backdrop-blur-sm shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/30" />
                    <CardHeader>
                        <SectionHeader icon={AlertCircle} title="Conteúdo" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Label className="text-slate-300">Postamos hoje?</Label>
                        <ToggleGroup type="single" value={check.contentStatus} onValueChange={(v) => v && updateField('contentStatus', v)} className="bg-black/40 p-1 rounded-lg border border-white/5">
                            <ToggleGroupItem value="posted" className="flex-1 data-[state=on]:bg-purple-500/20 data-[state=on]:text-purple-400 text-slate-400 hover:text-slate-200 transaction-all">Feito ✅</ToggleGroupItem>
                            <ToggleGroupItem value="missed" className="flex-1 data-[state=on]:bg-rose-500/20 data-[state=on]:text-rose-400 text-slate-400 hover:text-slate-200 transaction-all">Falha ❌</ToggleGroupItem>
                            <ToggleGroupItem value="rest_day" className="flex-1 data-[state=on]:bg-blue-500/20 data-[state=on]:text-blue-400 text-slate-400 hover:text-slate-200 transaction-all">Descanso 💤</ToggleGroupItem>
                        </ToggleGroup>

                        {check.contentStatus === 'missed' && (
                            <div className="animate-in slide-in-from-top-2">
                                <Label className="text-rose-400 mb-2 block">Por que não saiu?</Label>
                                <Textarea
                                    placeholder="Falta de tempo? Bloqueio criativo?"
                                    className="bg-black/40 border-rose-500/30 focus:border-rose-500 text-white min-h-[80px]"
                                    value={check.contentMissedReason}
                                    onChange={e => updateField('contentMissedReason', e.target.value)}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Comercial */}
                <Card className="bg-black/20 border-white/5 backdrop-blur-sm shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/30" />
                    <CardHeader>
                        <SectionHeader icon={DollarSign} title="Comercial" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Label className="text-slate-300">Batemos a meta do dia?</Label>
                        <ToggleGroup type="single" value={check.commercialAlignment} onValueChange={(v) => v && updateField('commercialAlignment', v)} className="bg-black/40 p-1 rounded-lg border border-white/5">
                            <ToggleGroupItem value="aligned" className="flex-1 data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400 text-slate-400 hover:text-slate-200 transaction-all">Na meta 🎯</ToggleGroupItem>
                            <ToggleGroupItem value="unsatisfactory" className="flex-1 data-[state=on]:bg-amber-500/20 data-[state=on]:text-amber-400 text-slate-400 hover:text-slate-200 transaction-all">Abaixo 📉</ToggleGroupItem>
                            <ToggleGroupItem value="zero" className="flex-1 data-[state=on]:bg-rose-500/20 data-[state=on]:text-rose-400 text-slate-400 hover:text-slate-200 transaction-all">Zerado 💀</ToggleGroupItem>
                        </ToggleGroup>

                        {(check.commercialAlignment === 'unsatisfactory' || check.commercialAlignment === 'zero') && (
                            <div className="animate-in slide-in-from-top-2">
                                <Label className="text-amber-400 mb-2 block">Plano de recuperação:</Label>
                                <Textarea
                                    placeholder="O que faremos diferente amanhã?"
                                    className="bg-black/40 border-amber-500/30 focus:border-amber-500 text-white min-h-[80px]"
                                    value={check.commercialGap}
                                    onChange={e => updateField('commercialGap', e.target.value)}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sentimento & Win */}
                <div className="space-y-6">
                    <Card className="bg-black/20 border-white/5 backdrop-blur-sm shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/30" />
                        <CardHeader>
                            <SectionHeader icon={TrendingUp} title="Amanhã" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Label className="text-slate-300">Tendência para amanhã:</Label>
                            <ToggleGroup type="single" value={check.tomorrowTrend} onValueChange={(v) => v && updateField('tomorrowTrend', v)} className="bg-black/40 p-1 rounded-lg border border-white/5">
                                <ToggleGroupItem value="better" className="flex-1 data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400 text-slate-400 hover:text-slate-200 transaction-all">Melhor 🚀</ToggleGroupItem>
                                <ToggleGroupItem value="same" className="flex-1 data-[state=on]:bg-blue-500/20 data-[state=on]:text-blue-400 text-slate-400 hover:text-slate-200 transaction-all">Igual ⏸️</ToggleGroupItem>
                                <ToggleGroupItem value="worse" className="flex-1 data-[state=on]:bg-rose-500/20 data-[state=on]:text-rose-400 text-slate-400 hover:text-slate-200 transaction-all">Pior ⛈️</ToggleGroupItem>
                            </ToggleGroup>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 backdrop-blur-md shadow-2xl relative overflow-hidden">
                        <CardHeader>
                            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                                <span className="text-2xl">🏆</span> Daily Win
                            </h3>
                        </CardHeader>
                        <CardContent>
                            <Label className="text-slate-300 mb-2 block">Qual foi a maior vitória de hoje?</Label>
                            <Textarea
                                placeholder="Fechei aquele contrato, resolvi aquele bug..."
                                className="bg-black/40 border-primary/20 text-white min-h-[100px] focus-visible:ring-primary/50"
                                value={check.dailyWin}
                                onChange={e => updateField('dailyWin', e.target.value)}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
