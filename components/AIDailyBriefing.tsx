'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { getAIContext } from '@/lib/ai-context';
import { cn } from '@/lib/utils';

export default function AIDailyBriefing() {
    const [briefing, setBriefing] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateBriefing = async () => {
        setIsLoading(true);
        try {
            const context = getAIContext();
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Gere meu BRIEFING DIÁRIO oficial baseado nos dados atuais. Siga rigorosamente os 8 pontos de observação: Tarefas atrasadas, Entregas do dia, Posts, Alcance, Engajamento, Leads, Agendamentos e Vendas.' }],
                    context
                }),
            });

            const data = await response.json();
            setBriefing(data.content);
        } catch (error) {
            console.error('Briefing failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Generate briefing once if context is available
        generateBriefing();
    }, []);

    return (
        <Card className="border-primary/30 bg-primary/5 overflow-hidden shadow-lg animate-fade-in relative">
            <div className="absolute top-0 right-0 p-3 opacity-20">
                <Sparkles className="w-12 h-12 text-primary" />
            </div>

            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Briefing Estratégico do Dia
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={generateBriefing} disabled={isLoading} className="h-8 w-8">
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="min-h-[100px]">
                {isLoading ? (
                    <div className="py-8 text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s] mx-1" />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        </div>
                        <p className="text-sm text-muted-foreground animate-pulse">Sintonizando frequências estratégicas...</p>
                    </div>
                ) : briefing ? (
                    <div className="prose prose-invert prose-sm max-w-none text-muted-foreground space-y-4 whitespace-pre-wrap">
                        {briefing}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground italic">Clique em atualizar para gerar seu briefing baseado nos dados atuais.</p>
                )}
            </CardContent>

            <div className="bg-primary/10 px-6 py-3 flex items-center gap-3 border-t border-primary/20">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <p className="text-[11px] text-primary/80 font-medium">Use este painel para orientar execução, conteúdo e comercial hoje.</p>
            </div>
        </Card>
    );
}
