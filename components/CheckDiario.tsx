'use client';

import { useState, useEffect } from 'react';
import { Clock, Save, CheckCircle2, ChevronRight, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import { storage, DailyCheck, OperationStatus, ContentStatus, CommercialAlignment, TomorrowTrend } from '@/lib/storage';
import { getTodayISO, getRelativeTime } from '@/lib/date-utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
        <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
            {/* Header Card */}
            <Card className="border-l-4 border-l-primary bg-secondary/30">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-xl">Check Diário</CardTitle>
                            <CardDescription>Consciência operacional</CardDescription>
                        </div>
                        <Badge variant="outline" className="flex gap-1 data-[saved=true]:bg-emerald-500/10 data-[saved=true]:text-emerald-500" data-saved={!!lastSaved}>
                            <Clock className="w-3 h-3" />
                            {lastSaved ? 'Salvo' : 'Pendente'}
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            {/* Questions Stack */}
            <div className="space-y-4">
                {/* 1. Operation */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            Como está a operação hoje?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={check.operationStatus} onValueChange={(v) => setCheck({ ...check, operationStatus: v as OperationStatus })} className="w-full">
                            <TabsList className="w-full grid grid-cols-3">
                                <TabsTrigger value="green">🟢 Sob controle</TabsTrigger>
                                <TabsTrigger value="yellow">🟡 Atenção</TabsTrigger>
                                <TabsTrigger value="red">🔴 Travando</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* 2. Content */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            O conteúdo cumpriu seu papel?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={check.contentStatus} onValueChange={(v) => setCheck({ ...check, contentStatus: v as ContentStatus })} className="w-full">
                            <TabsList className="w-full grid grid-cols-3">
                                <TabsTrigger value="fulfilled">Sim</TabsTrigger>
                                <TabsTrigger value="at-risk">Em risco</TabsTrigger>
                                <TabsTrigger value="not-priority">Não prioritário</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* 3. Commercial */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                <DollarSign className="w-4 h-4" />
                            </div>
                            O comercial está alinhado?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={check.commercialAlignment} onValueChange={(v) => setCheck({ ...check, commercialAlignment: v as CommercialAlignment })} className="w-full">
                            <TabsList className="w-full grid grid-cols-3">
                                <TabsTrigger value="aligned">Sim</TabsTrigger>
                                <TabsTrigger value="partial">Parcialmente</TabsTrigger>
                                <TabsTrigger value="misaligned">Não</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* 4. Bottleneck */}
                <Card className={cn("transition-all", check.hasBottleneck ? "border-amber-500/50" : "")}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                    <AlertCircle className="w-4 h-4" />
                                </div>
                                Existe gargalo visível?
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <span className={cn("text-sm transition-colors", check.hasBottleneck ? "text-amber-500 font-medium" : "text-muted-foreground")}>
                                    {check.hasBottleneck ? "Sim, existe." : "Não, tudo flui."}
                                </span>
                                <Button
                                    size="sm"
                                    variant={check.hasBottleneck ? "default" : "outline"}
                                    onClick={() => setCheck(prev => ({ ...prev, hasBottleneck: !prev.hasBottleneck }))}
                                    className={cn("h-7 text-xs", check.hasBottleneck ? "bg-amber-500 hover:bg-amber-600 border-amber-500" : "")}
                                >
                                    Alterar
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    {check.hasBottleneck && (
                        <CardContent className="animate-fade-in">
                            <div className="space-y-2">
                                <Label>Descreva em uma frase (máx 140)</Label>
                                <textarea
                                    value={check.bottleneckDescription || ''}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 140) {
                                            setCheck({ ...check, bottleneckDescription: e.target.value });
                                        }
                                    }}
                                    placeholder="Ex: Aprovação pendente no criativo X..."
                                    className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                                />
                                <div className="text-right text-xs text-muted-foreground">
                                    {(check.bottleneckDescription || '').length}/140
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* 5. Trend */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            Tendência para amanhã
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={check.tomorrowTrend} onValueChange={(v) => setCheck({ ...check, tomorrowTrend: v as TomorrowTrend })} className="w-full">
                            <TabsList className="w-full grid grid-cols-3">
                                <TabsTrigger value="better">Melhor ↗</TabsTrigger>
                                <TabsTrigger value="same">Igual →</TabsTrigger>
                                <TabsTrigger value="worse">Pior ↘</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Footer Action */}
            <div className="sticky bottom-4 z-10 pt-4">
                <Button
                    size="lg"
                    className="w-full shadow-2xl shadow-primary/30"
                    onClick={handleSave}
                    disabled={!isComplete || isSaving}
                >
                    {isSaving ? (
                        <>
                            <CheckCircle2 className="w-5 h-5 mr-2 animate-pulse" />
                            Salvando
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Salvar Check Diário
                        </>
                    )}
                </Button>
                {lastSaved && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                        Sincronizado {getRelativeTime(lastSaved)}
                    </p>
                )}
            </div>
        </div>
    );
}
