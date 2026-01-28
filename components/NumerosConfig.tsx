'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Edit2, Check, AlertCircle, Save } from 'lucide-react';
import { AnchorMetric, MetricCategory, MetricFrequency, MetricDirection, storage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BadgeStatus } from '@/components/ui/badge-status';
import { SegmentedControl, SegmentedControlList, SegmentedControlTrigger } from '@/components/ui/segmented-control';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function NumerosConfig() {
    const supabase = createClient();
    const [metrics, setMetrics] = useState<AnchorMetric[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [currentMetric, setCurrentMetric] = useState<Partial<AnchorMetric>>({
        category: 'Operação',
        frequency: 'weekly',
        direction: 'higher_better',
        isActive: true,
        guardrails: { green: {}, yellow: {}, red: {} },
        playbook: { actionIfYellow: '', actionIfRed: '' }
    });

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = () => {
        setMetrics(storage.getAnchorMetrics());
    };

    const handleSave = async () => {
        if (!currentMetric.name || !currentMetric.unit) return;

        const newMetric: AnchorMetric = {
            id: currentMetric.id || uuidv4(),
            name: currentMetric.name,
            category: currentMetric.category || 'Operação',
            frequency: currentMetric.frequency || 'weekly',
            direction: currentMetric.direction || 'higher_better',
            unit: currentMetric.unit,
            sourceNote: currentMetric.sourceNote || '',
            guardrails: currentMetric.guardrails || { green: {}, yellow: {}, red: {} },
            playbook: currentMetric.playbook || { actionIfYellow: '', actionIfRed: '' },
            isActive: true,
            createdAt: currentMetric.createdAt || new Date().toISOString()
        };

        // Save local
        storage.saveAnchorMetric(newMetric);

        // Sync to Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await supabase.from('anchor_metrics').upsert({
                id: newMetric.id,
                user_id: session.user.id,
                payload: newMetric,
                updated_at: new Date().toISOString()
            });
        }

        loadMetrics();
        setIsEditing(false);
        resetForm();
    };

    const deleteMetric = async (id: string) => {
        if (!confirm('Tem certeza? Isso apaga todo o histórico desta métrica.')) return;

        storage.deleteAnchorMetric(id);

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await supabase.from('anchor_metrics').delete().eq('id', id);
        }

        loadMetrics();
    };

    const resetForm = () => {
        setCurrentMetric({
            category: 'Operação',
            frequency: 'weekly',
            direction: 'higher_better',
            isActive: true,
            guardrails: { green: {}, yellow: {}, red: {} },
            playbook: { actionIfYellow: '', actionIfRed: '' }
        });
    };

    const editMetric = (metric: AnchorMetric) => {
        setCurrentMetric(metric);
        setIsEditing(true);
    };

    if (isEditing) {
        return (
            <Card className="animate-fade-in">
                <CardHeader>
                    <CardTitle>{currentMetric.id ? 'Editar Métrica' : 'Nova Métrica Âncora'}</CardTitle>
                    <CardDescription>
                        Defina os limites que protegem sua operação.
                        <span className="block mt-1 text-xs italic opacity-70">"Limites não servem para pressionar. Servem para proteger."</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!currentMetric.id && !currentMetric.name && (
                        <div className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <Label className="text-xs uppercase tracking-wider opacity-60">Templates Rápidos</Label>
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" onClick={() => setCurrentMetric({
                                    ...currentMetric,
                                    name: 'Leads Novos',
                                    unit: 'leads',
                                    category: 'Comercial',
                                    direction: 'higher_better',
                                    guardrails: { yellow: { min: 5 }, red: { min: 2 }, green: { min: 10 } },
                                    playbook: { actionIfYellow: 'Revisar canais de aquisição.', actionIfRed: 'Puxar lista quente e ajustar CTA.' }
                                })}>Leads</Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentMetric({
                                    ...currentMetric,
                                    name: 'Vendas',
                                    unit: 'R$',
                                    category: 'Comercial',
                                    direction: 'higher_better',
                                    guardrails: { yellow: { min: 1000 }, red: { min: 500 }, green: { min: 2000 } },
                                    playbook: { actionIfYellow: 'Acelerar follow-ups.', actionIfRed: 'Revisar pipeline e objeções.' }
                                })}>Vendas</Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentMetric({
                                    ...currentMetric,
                                    name: 'Posts',
                                    unit: 'posts',
                                    category: 'Conteúdo',
                                    direction: 'higher_better',
                                    guardrails: { yellow: { min: 3 }, red: { min: 1 }, green: { min: 5 } },
                                    playbook: { actionIfYellow: 'Simplificar formato do post.', actionIfRed: 'Focar em 1 conteúdo essencial.' }
                                })}>Posts</Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentMetric({
                                    ...currentMetric,
                                    name: 'Atrasos',
                                    unit: 'tarefas',
                                    category: 'Operação',
                                    direction: 'lower_better',
                                    guardrails: { yellow: { max: 2 }, red: { max: 5 }, green: { max: 0 } },
                                    playbook: { actionIfYellow: 'Revisar prioridades.', actionIfRed: 'Escalar ou delegar carga.' }
                                })}>Atrasos</Button>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome da Métrica</Label>
                            <Input
                                placeholder="Ex: Leads Qualificados"
                                value={currentMetric.name || ''}
                                onChange={e => setCurrentMetric({ ...currentMetric, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <SegmentedControl value={currentMetric.category} onValueChange={(v: string) => setCurrentMetric({ ...currentMetric, category: v as MetricCategory })}>
                                <SegmentedControlList>
                                    <SegmentedControlTrigger value="Operação">Operação</SegmentedControlTrigger>
                                    <SegmentedControlTrigger value="Conteúdo">Conteúdo</SegmentedControlTrigger>
                                    <SegmentedControlTrigger value="Comercial">Comercial</SegmentedControlTrigger>
                                </SegmentedControlList>
                            </SegmentedControl>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Frequência</Label>
                            <SegmentedControl value={currentMetric.frequency} onValueChange={(v: string) => setCurrentMetric({ ...currentMetric, frequency: v as MetricFrequency })}>
                                <SegmentedControlList>
                                    <SegmentedControlTrigger value="daily">Diário</SegmentedControlTrigger>
                                    <SegmentedControlTrigger value="weekly">Semanal</SegmentedControlTrigger>
                                </SegmentedControlList>
                            </SegmentedControl>
                        </div>
                        <div className="space-y-2">
                            <Label>Unidade</Label>
                            <Input
                                placeholder="Ex: leads, R$, %"
                                value={currentMetric.unit || ''}
                                onChange={e => setCurrentMetric({ ...currentMetric, unit: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Direção</Label>
                            <SegmentedControl value={currentMetric.direction} onValueChange={(v: string) => setCurrentMetric({ ...currentMetric, direction: v as MetricDirection })}>
                                <SegmentedControlList>
                                    <SegmentedControlTrigger value="higher_better">Maior é melhor ⬆</SegmentedControlTrigger>
                                    <SegmentedControlTrigger value="lower_better">Menor é melhor ⬇</SegmentedControlTrigger>
                                </SegmentedControlList>
                            </SegmentedControl>
                        </div>
                    </div>

                    {/* Guardrails Section */}
                    <div className="p-4 bg-secondary/20 rounded-xl border border-border/50 space-y-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-primary" />
                            <h3 className="font-medium text-sm">Guardrails (Limites de Segurança)</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-amber-500">Alerta Amarelo (Atenção) se:</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {currentMetric.direction === 'higher_better' ? '< Menor que' : '> Maior que'}
                                    </span>
                                    <Input
                                        type="number"
                                        className="w-24"
                                        placeholder="0"
                                        value={currentMetric.direction === 'higher_better' ? (currentMetric.guardrails?.yellow?.min ?? '') : (currentMetric.guardrails?.yellow?.max ?? '')}
                                        onChange={e => {
                                            const val = Number(e.target.value);
                                            const newGuardrails = { ...currentMetric.guardrails! };
                                            if (currentMetric.direction === 'higher_better') {
                                                newGuardrails.yellow.min = val;
                                            } else {
                                                newGuardrails.yellow.max = val;
                                            }
                                            setCurrentMetric({ ...currentMetric, guardrails: newGuardrails });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-red-500">Alerta Vermelho (Perigo) se:</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {currentMetric.direction === 'higher_better' ? '< Menor que' : '> Maior que'}
                                    </span>
                                    <Input
                                        type="number"
                                        className="w-24"
                                        placeholder="0"
                                        value={currentMetric.direction === 'higher_better' ? (currentMetric.guardrails?.red?.min ?? '') : (currentMetric.guardrails?.red?.max ?? '')}
                                        onChange={e => {
                                            const val = Number(e.target.value);
                                            const newGuardrails = { ...currentMetric.guardrails! };
                                            if (currentMetric.direction === 'higher_better') {
                                                newGuardrails.red.min = val;
                                            } else {
                                                newGuardrails.red.max = val;
                                            }
                                            setCurrentMetric({ ...currentMetric, guardrails: newGuardrails });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Playbook Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Playbook: Se ficar <span className="text-amber-500">AMARELO</span>, faça:</Label>
                            <Input
                                placeholder="Uma ação simples. Ex: Revisar campanhas ativas."
                                value={currentMetric.playbook?.actionIfYellow || ''}
                                onChange={e => setCurrentMetric({
                                    ...currentMetric,
                                    playbook: { ...currentMetric.playbook!, actionIfYellow: e.target.value }
                                })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Playbook: Se ficar <span className="text-red-500">VERMELHO</span>, faça:</Label>
                            <Input
                                placeholder="Ação de emergência. Ex: Pausar anúncios e convocar reunião."
                                value={currentMetric.playbook?.actionIfRed || ''}
                                onChange={e => setCurrentMetric({
                                    ...currentMetric,
                                    playbook: { ...currentMetric.playbook!, actionIfRed: e.target.value }
                                })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button className="flex-1" onClick={handleSave} disabled={!currentMetric.name || !currentMetric.unit}>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Métrica
                        </Button>
                        <Button variant="outline" onClick={() => { setIsEditing(false); resetForm(); }}>
                            Cancelar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* New Metric Card */}
                <button
                    onClick={() => {
                        if (metrics.length >= 12) {
                            alert('Limite de 12 métricas atingido. "Poucos números. Clareza total."');
                            return;
                        }
                        resetForm();
                        setIsEditing(true);
                    }}
                    className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50 transition-all h-[200px] group"
                >
                    <div className="p-4 rounded-full bg-secondary group-hover:bg-primary/10 mb-4 transition-colors">
                        <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="font-medium text-muted-foreground group-hover:text-foreground">Nova Métrica Âncora</span>
                </button>

                {/* Existing Metrics List */}
                {metrics.map(metric => (
                    <Card key={metric.id} className="relative group hover:border-primary/50 transition-colors h-[200px] flex flex-col justify-between">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => editMetric(metric)}>
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-500" onClick={() => deleteMetric(metric.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start pr-8">
                                <BadgeStatus variant="outline">{metric.category}</BadgeStatus>
                                <span className="text-xs text-muted-foreground uppercase">{metric.frequency === 'daily' ? 'Diário' : 'Semanal'}</span>
                            </div>
                            <CardTitle className="text-lg leading-tight mt-2">{metric.name}</CardTitle>
                            <CardDescription>{metric.unit} • {metric.direction === 'higher_better' ? 'Maior melhor' : 'Menor melhor'}</CardDescription>
                        </CardHeader>

                        <CardContent className="pt-0 pb-6">
                            <div className="flex gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    {metric.direction === 'higher_better' ? `< ${metric.guardrails.yellow.min}` : `> ${metric.guardrails.yellow.max}`}
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    {metric.direction === 'higher_better' ? `< ${metric.guardrails.red.min}` : `> ${metric.guardrails.red.max}`}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {metrics.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>Nenhuma métrica configurada. Comece definindo o que importa.</p>
                </div>
            )}
        </div>
    );
}

