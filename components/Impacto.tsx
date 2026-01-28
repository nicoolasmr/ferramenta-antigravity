'use client';

import { useState, useEffect } from 'react';
import { Save, Copy, CheckCircle2, History, Award, Zap, TrendingUp, DollarSign } from 'lucide-react';
import { storage, ImpactLog } from '@/lib/storage';
import { getTodayISO, formatDate } from '@/lib/date-utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const IMPACT_OPTIONS = {
    operation: [
        'Projetos organizados',
        'Crises evitadas',
        'Gargalos destravados',
        'Processos melhorados',
    ],
    content: [
        'Constância mantida',
        'Narrativa alinhada',
        'Campanhas apoiadas',
        'Materiais destravados',
    ],
    commercial: [
        'Leads qualificados',
        'Campanhas sustentadas',
        'Alinhamento melhorou',
        'Vendas facilitadas',
    ],
};

export default function Impacto() {
    const supabase = createClient();
    const [log, setLog] = useState<ImpactLog>({
        date: getTodayISO(),
        operation: [],
        content: [],
        commercial: [],
        reflection: '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<ImpactLog[]>([]);

    useEffect(() => {
        const logs = storage.getImpactLogs();
        setHistory(logs.sort((a, b) => b.date.localeCompare(a.date)));

        const todayLog = logs.find(l => l.date === getTodayISO());
        if (todayLog) {
            setLog(todayLog);
        }
    }, []);

    const toggleImpact = (category: keyof typeof IMPACT_OPTIONS, item: string) => {
        const current = log[category];
        const updated = current.includes(item)
            ? current.filter(i => i !== item)
            : [...current, item];

        setLog({ ...log, [category]: updated });
    };

    const handleSave = async () => {
        setIsSaving(true);
        storage.saveImpactLog(log);

        // Sync to Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { error } = await supabase
                .from('impact_logs')
                .upsert({
                    user_id: session.user.id,
                    date: log.date,
                    payload: log,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, date' })

            if (error) console.error("Sync error:", error);
        }

        // Update history
        const logs = storage.getImpactLogs();
        setHistory(logs.sort((a, b) => b.date.localeCompare(a.date)));

        setTimeout(() => {
            setIsSaving(false);
        }, 800);
    };

    const handleCopy = () => {
        const text = `
IMPACTO - ${formatDate(log.date, 'dd/MM/yyyy')}

OPERAÇÃO:
${log.operation.map(i => `✓ ${i}`).join('\n') || '(nenhum impacto registrado)'}

CONTEÚDO:
${log.content.map(i => `✓ ${i}`).join('\n') || '(nenhum impacto registrado)'}

COMERCIAL:
${log.commercial.map(i => `✓ ${i}`).join('\n') || '(nenhum impacto registrado)'}

REFLEXÃO:
${log.reflection || '(sem reflexão)'}
    `.trim();

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const totalImpacts = log.operation.length + log.content.length + log.commercial.length;

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
            {/* Header Card */}
            <Card className="border-l-4 border-l-primary bg-secondary/30">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Impacto</CardTitle>
                            <CardDescription>Prova de valor diária</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {totalImpacts > 0 && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                    <Award className="w-3 h-3 mr-1" />
                                    {totalImpacts}
                                </Badge>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => setShowHistory(!showHistory)}>
                                <History className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Impact Grid */}
            <div className="grid grid-cols-1 gap-6">
                {/* 1. Operation */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                <Zap className="w-4 h-4" />
                            </div>
                            Operação
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {IMPACT_OPTIONS.operation.map((item) => (
                            <div
                                key={item}
                                onClick={() => toggleImpact('operation', item)}
                                className={cn(
                                    "cursor-pointer p-3 rounded-xl border text-sm font-medium transition-all select-none flex items-center justify-between",
                                    log.operation.includes(item)
                                        ? "bg-primary/10 border-primary text-primary shadow-sm"
                                        : "bg-background border-border hover:bg-secondary/50 text-muted-foreground"
                                )}
                            >
                                {item}
                                {log.operation.includes(item) && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 2. Content */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            Conteúdo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {IMPACT_OPTIONS.content.map((item) => (
                            <div
                                key={item}
                                onClick={() => toggleImpact('content', item)}
                                className={cn(
                                    "cursor-pointer p-3 rounded-xl border text-sm font-medium transition-all select-none flex items-center justify-between",
                                    log.content.includes(item)
                                        ? "bg-primary/10 border-primary text-primary shadow-sm"
                                        : "bg-background border-border hover:bg-secondary/50 text-muted-foreground"
                                )}
                            >
                                {item}
                                {log.content.includes(item) && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 3. Commercial */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                <DollarSign className="w-4 h-4" />
                            </div>
                            Comercial
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {IMPACT_OPTIONS.commercial.map((item) => (
                            <div
                                key={item}
                                onClick={() => toggleImpact('commercial', item)}
                                className={cn(
                                    "cursor-pointer p-3 rounded-xl border text-sm font-medium transition-all select-none flex items-center justify-between",
                                    log.commercial.includes(item)
                                        ? "bg-primary/10 border-primary text-primary shadow-sm"
                                        : "bg-background border-border hover:bg-secondary/50 text-muted-foreground"
                                )}
                            >
                                {item}
                                {log.commercial.includes(item) && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Reflection */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Reflexão (Opcional)</CardTitle>
                        <CardDescription>O que não teria acontecido sem sua atuação?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            value={log.reflection}
                            onChange={(e) => setLog({ ...log, reflection: e.target.value })}
                            placeholder="Hoje eu evitei que..."
                            className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-4 z-10 pt-4 flex gap-3">
                <Button
                    size="lg"
                    className="flex-1 shadow-2xl shadow-primary/30"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <CheckCircle2 className="w-5 h-5 mr-2 animate-pulse" />
                            Salvando
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Salvar
                        </>
                    )}
                </Button>

                <Button
                    size="lg"
                    variant="secondary"
                    onClick={handleCopy}
                >
                    {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </Button>
            </div>

            {/* History Drawer (Conditional) */}
            {showHistory && history.length > 0 && (
                <div className="space-y-4 animate-fade-in pt-8 border-t border-border">
                    <h3 className="text-lg font-medium">Histórico</h3>
                    <div className="space-y-3">
                        {history.slice(0, 5).map((entry) => {
                            const total = entry.operation.length + entry.content.length + entry.commercial.length;
                            return (
                                <Card key={entry.date} className="bg-secondary/20">
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-sm">
                                                {formatDate(entry.date, "d 'de' MMMM")}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                {total} impactos
                                            </Badge>
                                        </div>
                                        {entry.reflection && (
                                            <p className="text-xs text-muted-foreground line-clamp-2 italic">
                                                "{entry.reflection}"
                                            </p>
                                        )}
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
