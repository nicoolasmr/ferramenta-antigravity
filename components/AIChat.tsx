'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Command } from 'lucide-react';
import { getAIContext } from '@/lib/ai-context';
import { storage, DailyCheck, MetricEntry, WeeklyPlan, ImpactLog } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AICommand {
    action: string;
    data: any;
}

export default function AIChat() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Olá. Estou conectado ao centro de controle. Pode me contar como foi seu dia ou me dar comandos diretos.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [executingCommand, setExecutingCommand] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, executingCommand]);

    const executeCommand = async (command: AICommand) => {
        console.log('Executing command:', command);
        setExecutingCommand(command.action);

        await new Promise(resolve => setTimeout(resolve, 800)); // Fake visual delay for "processing"

        try {
            switch (command.action) {
                case 'UPDATE_DAILY_CHECK':
                    const todayCheck: DailyCheck = {
                        date: new Date().toISOString().split('T')[0],
                        ...command.data
                    };
                    storage.saveDailyCheck(todayCheck);
                    // toast.success('Check diário atualizado!');
                    break;

                case 'UPDATE_METRIC_ENTRY':
                    const metrics = storage.getAnchorMetrics();
                    // Try exact match or loose match
                    const metric = metrics.find(m =>
                        m.name.toLowerCase() === command.data.metricName.toLowerCase() ||
                        m.name.toLowerCase().includes(command.data.metricName.toLowerCase())
                    );

                    if (metric) {
                        const entry: MetricEntry = {
                            metricId: metric.id,
                            date: command.data.date || new Date().toISOString().split('T')[0],
                            value: Number(command.data.value),
                            status: 'green', // Default, logic should update based on guardrails
                            updatedAt: new Date().toISOString()
                        };
                        // Recalculate status based on metrics engine logic (simplified here or import engine)
                        // For now we trust the storage logic or need to import calculateMetricStatus
                        // Importing dynamically to avoid circular dep issues in this component refactor if needed
                        // But ideally we import calculateMetricStatus from metrics-engine

                        storage.saveMetricEntry(entry);
                        // toast.success(`Métrica ${metric.name} atualizada!`);
                    } else {
                        throw new Error(`Métrica não encontrada: ${command.data.metricName}`);
                    }
                    break;

                case 'UPDATE_WEEKLY_PLAN':
                    const plan: WeeklyPlan = {
                        weekStart: new Date().toISOString(), // This needs proper week calculation logic usually
                        ...command.data,
                        projects: [] // Default empty if not provided
                    };
                    storage.saveWeeklyPlan(plan);
                    break;

                case 'LOG_IMPACT':
                    const log: ImpactLog = {
                        date: new Date().toISOString().split('T')[0],
                        operation: command.data.category === 'Operação' ? [command.data.reflection] : [],
                        content: command.data.category === 'Conteúdo' ? [command.data.reflection] : [],
                        commercial: command.data.category === 'Comercial' ? [command.data.reflection] : [],
                        reflection: command.data.reflection
                    };
                    storage.saveImpactLog(log);
                    break;

                default:
                    console.warn('Unknown command:', command.action);
            }
        } catch (error) {
            console.error('Command execution failed:', error);
            // toast.error('Erro ao executar comando da IA');
        } finally {
            setExecutingCommand(null);
            // Verify sync/reload might be needed if using React state elsewhere that doesn't listen to storage
            // In a real app we'd use a context or SWR/Tanstack Query for reactivity
            // For now, we rely on component mounts to refresh data
            window.dispatchEvent(new Event('storage')); // Trigger storage event for listeners
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const context = getAIContext();
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    context
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            let cleanContent = data.content;

            // Detect JSON Command
            if (data.content.includes('__JSON_START__')) {
                const [textPart, jsonPart] = data.content.split('__JSON_START__');
                cleanContent = textPart.trim();

                const jsonString = jsonPart.split('__JSON_END__')[0];
                try {
                    const command = JSON.parse(jsonString);
                    await executeCommand(command);
                } catch (e) {
                    console.error('Failed to parse AI command', e);
                }
            }

            setMessages(prev => [...prev, { role: 'assistant', content: cleanContent }]);
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, tive um problema de conexão. Tente novamente.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="flex flex-col h-[600px] border-white/5 bg-card/40 backdrop-blur-xl overflow-hidden shadow-2xl relative">
            <CardHeader className="border-b border-white/5 bg-white/5 py-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg border border-primary/20">
                        <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold text-white tracking-tight">Centro de Comando</CardTitle>
                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-primary">
                            <Sparkles className="w-3 h-3" />
                            Agente Conectado
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={cn(
                        "flex w-full animate-fade-in",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                    )}>
                        <div className={cn(
                            "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap font-medium shadow-xl transition-all",
                            msg.role === 'user'
                                ? "bg-primary text-white rounded-tr-none border border-primary/20"
                                : "bg-black/40 border border-white/5 rounded-tl-none text-slate-300"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-black/40 border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-wider">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            Pensando...
                        </div>
                    </div>
                )}

                {executingCommand && (
                    <div className="flex justify-center w-full animate-slide-in">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <Command className="w-3 h-3 animate-spin" />
                            Executando: {executingCommand}...
                        </div>
                    </div>
                )}
            </CardContent>

            <div className="p-4 border-t border-white/5 bg-black/20">
                <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                    <Input
                        placeholder="Atualize o dia, números ou peça ajuda..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={isLoading}
                        className="flex-1 bg-black/40 border-white/5 text-white placeholder:text-slate-600 focus-visible:ring-primary/50 focus-visible:ring-offset-0 rounded-xl h-12 transition-all"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
            {/* Background Glow */}
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-3xl -z-10" />
        </Card>
    );
}
