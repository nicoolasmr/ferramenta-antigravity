'use client';

import { useState, useEffect } from 'react';
import { Sparkles, RefreshCcw, TrendingUp, AlertTriangle, Target, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/utils';

export default function AIDailyBriefing() {
    const [briefing, setBriefing] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        // Mock generation for now, will connect to real logic
        generateBriefing();
    }, []);

    const generateBriefing = () => {
        setIsGenerating(true);
        // Simulate AI logic
        setTimeout(() => {
            setBriefing(`
## # BRIEFING DIÁRIO

### ## 1. O QUE OLHAR E POR QUÊ:

#### ### Tarefas Atrasadas
- **Status Atual**: Não há dados disponíveis sobre tarefas atrasadas.
- **Importância**: Atrasos afetam entregas e confiança. É crucial evitar atrasos superiores a 24 horas.

#### ### Entregas do Dia
- **Status Atual**: Nenhuma entrega registrada.
- **Importância**: Garante a cadência operacional. Idealmente, 80% das entregas diárias devem estar concluídas até as 16h.

#### ### posts Publicados
- **Status Atual**: Sem dados sobre posts recentes.
- **Importância**: Manutenção da consistência no funil de conteúdo. Atenção redobrada se houver dois ou mais dias sem publicação.

#### ### Alcance Total
- **Status Atual**: Sem dados de alcance disponíveis.
- **Importância**: Um indicador de distribuição de conteúdo. Monitorar quedas superiores a 20% em relação à média.

### ## SINAIS DE ALERTA SUPREMOS:
- **Execução escorregando**: Sem dados para análise.
- **Consistência de conteúdo quebrando**: Ausência de dados impede confirmação.
- **Funil comercial entupindo**: Não há informações suficientes.

### ## VISÃO ESTRATÉGICA:
Atualmente, não há dados suficientes para uma análise detalhada. Sugiro configurar um sistema de acompanhamento para cada métrica crítica mencionada. Isso garantirá que possamos monitorar e ajustar estratégias com base em dados concretos.

### ## AÇÃO SUGERIDA:
1. **Configurar Métricas**: Estabeleça um sistema de rastreamento para cada métrica.
2. **Rotina de Check-in**: Defina um horário diário para revisar as métricas e ajustar ações conforme necessário.
3. **Planejamento Semanal**: Inicie um plano semanal para alinhar equipes e metas.
            `);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <Card className="border-white/5 bg-card/40 backdrop-blur-xl overflow-hidden relative group">
            <CardHeader className="border-b border-white/5 bg-white/5 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg border border-primary/20">
                            <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-extrabold text-white tracking-tight">Briefing Estratégico do Dia</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={generateBriefing}
                        className={cn("rounded-full hover:bg-white/10 transition-all", isGenerating && "animate-spin")}
                    >
                        <RefreshCcw className="w-4 h-4 text-slate-400" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-8 prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-primary prose-li:text-slate-300">
                {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-6">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <Sparkles className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-bold text-white uppercase tracking-widest">Sincronizando Inteligência</p>
                            <p className="text-xs text-slate-500 font-medium lowercase italic">Processando métricas e playbooks...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in text-slate-300 leading-relaxed">
                        {briefing?.split('###').map((section, idx) => {
                            if (!section.trim()) return null;
                            const lines = section.trim().split('\n');
                            const title = lines[0].replace('##', '').trim();
                            const content = lines.slice(1).join('\n');

                            return (
                                <div key={idx} className="space-y-4">
                                    {title && (
                                        <h3 className="text-primary font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            {title}
                                        </h3>
                                    )}
                                    <div className="whitespace-pre-wrap text-sm md:text-base font-medium">
                                        {content.split('\n').map((line, lidx) => {
                                            if (line.startsWith('####')) {
                                                return <h4 key={lidx} className="text-white font-bold text-lg mt-6 mb-2">{line.replace('####', '').trim()}</h4>
                                            }
                                            if (line.startsWith('- **')) {
                                                const [label, text] = line.replace('- **', '').split('**:');
                                                return (
                                                    <div key={lidx} className="flex items-start gap-2 mb-1 pl-2">
                                                        <span className="text-primary mt-1">•</span>
                                                        <p className="text-sm">
                                                            <span className="text-slate-200 font-bold">{label}: </span>
                                                            <span className="text-slate-400">{text}</span>
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return <p key={lidx} className="mb-2 leading-relaxed opacity-80">{line}</p>;
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full -z-10 group-hover:bg-primary/10 transition-all" />
        </Card>
    );
}
