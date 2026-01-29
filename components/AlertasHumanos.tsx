'use client';

import { useState, useEffect } from 'react';
import { X, Shield, AlertCircle, Lightbulb, Zap, CheckCircle2 } from 'lucide-react';
import { storage, Alert } from '@/lib/storage';
import { analyzePatterns } from '@/lib/alert-engine';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export default function AlertasHumanos() {
    const supabase = createClient();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const dailyChecks = storage.getDailyChecks();
        const weeklyPlans = storage.getWeeklyPlans();
        const dismissed = storage.getDismissedAlerts();

        const generatedAlerts = analyzePatterns(dailyChecks, weeklyPlans);
        const activeAlerts = generatedAlerts.filter(a => !dismissed.includes(a.id));

        setAlerts(activeAlerts);
        setDismissedIds(dismissed);
        setLoading(false);
    }, []);

    const handleDismiss = async (alertId: string) => {
        // Optimistic update
        const newDismissed = [...dismissedIds, alertId];
        setDismissedIds(newDismissed);
        setAlerts(alerts.filter(a => a.id !== alertId));

        storage.dismissAlert(alertId);

        // Sync to Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { error } = await supabase
                .from('dismissed_alerts')
                .upsert({
                    user_id: session.user.id,
                    alert_id: alertId,
                    dismissed_at: new Date().toISOString()
                }, { onConflict: 'user_id, alert_id' })

            if (error) console.error("Sync error:", error);
        }
    };

    const getIcon = (type: Alert['type']) => {
        switch (type) {
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-rose-500" />;
            case 'caution':
                return <Zap className="w-5 h-5 text-amber-500" />;
            case 'info':
                return <Lightbulb className="w-5 h-5 text-emerald-500" />;
            default:
                return <Shield className="w-5 h-5 text-primary" />;
        }
    };

    const getStyles = (type: Alert['type']) => {
        switch (type) {
            case 'warning':
                return "border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10";
            case 'caution':
                return "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10";
            case 'info':
                return "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10";
            default:
                return "border-primary/20 bg-primary/5 hover:bg-primary/10";
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
            {/* Header Card */}
            <Card className="border-white/5 bg-card/40 backdrop-blur-xl">
                <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-8 bg-primary rounded-full" />
                            <div>
                                <CardTitle className="text-xl font-bold text-white">Alertas Humanos</CardTitle>
                                <CardDescription className="text-xs text-slate-500 font-medium">Sinais de cuidado, não de cobrança.</CardDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className="flex gap-1.5 items-center bg-white/5 border-white/10 rounded-full px-3 py-1">
                            <Shield className="w-3 h-3 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{alerts.length} Ativos</span>
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            {/* Alerts List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-xs text-slate-500 font-medium lowercase italic tracking-wide">analisando padrões...</span>
                </div>
            ) : alerts.length === 0 ? (
                <Card className="bg-emerald-500/5 border-emerald-500/10 border-dashed rounded-2xl">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                        <div className="p-5 bg-emerald-500/10 rounded-full border border-emerald-500/20 relative">
                            <Shield className="w-10 h-10 text-emerald-500" />
                            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full -z-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-emerald-500 tracking-tight">Tudo sob controle</h3>
                            <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
                                Nenhum padrão de risco detectado. Você está sustentando bem a operação hoje.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <Card key={alert.id} className={cn("transition-all relative overflow-hidden group border-white/5 shadow-2xl", getStyles(alert.type))}>
                            <CardContent className="p-6 flex gap-5">
                                <div className="mt-1 flex-shrink-0">
                                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                        {getIcon(alert.type)}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <h3 className="font-bold text-white leading-tight tracking-tight text-lg">
                                        {alert.message}
                                    </h3>
                                    {alert.suggestion && (
                                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                            {alert.suggestion}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="flex-shrink-0 -mr-2 -mt-2 h-9 w-9 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-all opacity-40 group-hover:opacity-100"
                                    onClick={() => handleDismiss(alert.id)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </CardContent>
                            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        </Card>
                    ))}
                </div>
            )}

            {/* Info Footer */}
            <div className="text-center">
                <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    <strong>Como funcionam:</strong> O sistema analisa checks diários e planos semanais para encontrar padrões de sobrecarga ou falta de clareza.
                    {dismissedIds.length > 0 && <span> ({dismissedIds.length} dispensados recentemente)</span>}
                </p>
            </div>
        </div>
    );
}
