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
            <Card className="border-l-4 border-l-primary bg-secondary/30">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Alertas Humanos</CardTitle>
                            <CardDescription>Sinais de cuidado, não de cobrança.</CardDescription>
                        </div>
                        <Badge variant="outline" className="flex gap-1">
                            <Shield className="w-3 h-3" />
                            {alerts.length} Ativos
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            {/* Alerts List */}
            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Carregando...</div>
            ) : alerts.length === 0 ? (
                <Card className="bg-emerald-500/5 border-emerald-500/20 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                        <div className="p-4 bg-emerald-500/10 rounded-full">
                            <Shield className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium text-emerald-500">Tudo sob controle</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                                Nenhum padrão de risco detectado. Você está sustentando bem a operação.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <Card key={alert.id} className={cn("transition-all relative overflow-hidden", getStyles(alert.type))}>
                            <CardContent className="p-6 flex gap-4">
                                <div className="mt-1 flex-shrink-0">
                                    {getIcon(alert.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-semibold text-foreground leading-none mb-2">
                                        {alert.message}
                                    </h3>
                                    {alert.suggestion && (
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {alert.suggestion}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="flex-shrink-0 -mr-2 -mt-2 hover:bg-background/20 hover:text-foreground"
                                    onClick={() => handleDismiss(alert.id)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </CardContent>
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
