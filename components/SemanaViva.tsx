'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, Plus, Trash2, AlertCircle, Target, Layers, ShoppingBag, Shield } from 'lucide-react';
import { storage, WeeklyPlan, Project, ContentPurpose, ProjectDependency } from '@/lib/storage';
import { getCurrentWeekStart, getNextWeekStart, getPreviousWeekStart, formatWeekRange } from '@/lib/date-utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function SemanaViva() {
    const supabase = createClient();
    const [currentWeekStart, setCurrentWeekStart] = useState(getCurrentWeekStart());
    const [plan, setPlan] = useState<WeeklyPlan>({
        weekStart: currentWeekStart,
        centerOfWeek: '',
        projects: [],
        content: {
            theme: '',
            purpose: 'grow',
        },
        commercial: {
            focusClear: false,
            hasActiveActions: false,
        },
    });

    const [isSaving, setIsSaving] = useState(false);

    // Load plan for current week
    useEffect(() => {
        const plans = storage.getWeeklyPlans();
        const existingPlan = plans.find(p => p.weekStart === currentWeekStart);

        if (existingPlan) {
            setPlan(existingPlan);
        } else {
            setPlan({
                weekStart: currentWeekStart,
                centerOfWeek: '',
                projects: [],
                content: {
                    theme: '',
                    purpose: 'grow',
                },
                commercial: {
                    focusClear: false,
                    hasActiveActions: false,
                },
            });
        }
    }, [currentWeekStart]);

    const handleSave = async () => {
        setIsSaving(true);
        storage.saveWeeklyPlan(plan);

        // Sync to Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { error } = await supabase
                .from('weekly_plans')
                .upsert({
                    user_id: session.user.id,
                    week_start: plan.weekStart,
                    payload: plan,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, week_start' })

            if (error) console.error("Sync error:", error);
        }

        setTimeout(() => {
            setIsSaving(false);
        }, 800);
    };

    const addProject = () => {
        const newProject: Project = {
            id: Date.now().toString(),
            name: '',
            isAdvancing: false,
            dependsOn: 'me',
            nextStepClear: false,
        };
        setPlan({ ...plan, projects: [...plan.projects, newProject] });
    };

    const updateProject = (id: string, updates: Partial<Project>) => {
        setPlan({
            ...plan,
            projects: plan.projects.map(p => p.id === id ? { ...p, ...updates } : p),
        });
    };

    const removeProject = (id: string) => {
        setPlan({
            ...plan,
            projects: plan.projects.filter(p => p.id !== id),
        });
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        setCurrentWeekStart(
            direction === 'prev'
                ? getPreviousWeekStart(currentWeekStart)
                : getNextWeekStart(currentWeekStart)
        );
    };

    const hasDispersion = !plan.centerOfWeek.trim();

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
            {/* Header Card */}
            <Card className="border-l-4 border-l-primary bg-secondary/30">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Semana Viva</CardTitle>
                            <CardDescription>Direção da semana</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 bg-background/50 rounded-lg p-1 border">
                            <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')} className="h-7 w-7">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-xs font-medium px-2 min-w-[100px] text-center">
                                {formatWeekRange(currentWeekStart)}
                            </span>
                            <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')} className="h-7 w-7">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {hasDispersion && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="text-amber-500 font-medium">Sem foco definido</p>
                        <p className="text-amber-500/80">
                            Sem um centro claro, a semana será reativa.
                        </p>
                    </div>
                </div>
            )}

            {/* Center of Week */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                            <Target className="w-4 h-4" />
                        </div>
                        Centro da Semana
                    </CardTitle>
                    <CardDescription>Se apenas UMA coisa avançar, qual será?</CardDescription>
                </CardHeader>
                <CardContent>
                    <Input
                        value={plan.centerOfWeek}
                        onChange={(e) => setPlan({ ...plan, centerOfWeek: e.target.value })}
                        placeholder="Ex: Lançar campanha de Black Friday..."
                        className="text-lg h-12"
                    />
                </CardContent>
            </Card>

            {/* Active Projects */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1.5">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                <Layers className="w-4 h-4" />
                            </div>
                            Projetos Ativos
                        </CardTitle>
                    </div>
                    <Button size="sm" variant="ghost" onClick={addProject}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {plan.projects.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                            <p className="text-sm">Nenhum projeto listado.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {plan.projects.map((project) => (
                                <div key={project.id} className="group bg-secondary/20 rounded-xl p-4 space-y-3 border border-border transition-all hover:bg-secondary/40">
                                    <div className="flex items-start gap-3">
                                        <Input
                                            value={project.name}
                                            onChange={(e) => updateProject(project.id, { name: e.target.value })}
                                            placeholder="Nome do projeto"
                                            className="bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto text-base font-medium placeholder:text-muted-foreground/50"
                                        />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => removeProject(project.id)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm pt-2 border-t border-border/50">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={project.isAdvancing}
                                                onChange={(e) => updateProject(project.id, { isAdvancing: e.target.checked })}
                                                className="rounded border-input bg-transparent text-primary focus:ring-primary"
                                            />
                                            <span className="text-muted-foreground">Avançando</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground text-xs">Depende:</span>
                                            <select
                                                value={project.dependsOn}
                                                onChange={(e) => updateProject(project.id, { dependsOn: e.target.value as ProjectDependency })}
                                                className="bg-transparent border-none text-xs font-medium focus:ring-0 cursor-pointer text-foreground"
                                            >
                                                <option value="me">Mim</option>
                                                <option value="others">Outros</option>
                                            </select>
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={project.nextStepClear}
                                                onChange={(e) => updateProject(project.id, { nextStepClear: e.target.checked })}
                                                className="rounded border-input bg-transparent text-primary focus:ring-primary"
                                            />
                                            <span className="text-muted-foreground">Próx. claro</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Content & Commercial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                <ShoppingBag className="w-4 h-4" />
                            </div>
                            Conteúdo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tema Central</Label>
                            <Input
                                value={plan.content.theme}
                                onChange={(e) => setPlan({ ...plan, content: { ...plan.content, theme: e.target.value } })}
                                placeholder="Sobre o que vamos falar?"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Objetivo Principal</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'grow' as ContentPurpose, label: 'Crescer', emoji: '📈' },
                                    { value: 'warm' as ContentPurpose, label: 'Aquecer', emoji: '🔥' },
                                    { value: 'sell' as ContentPurpose, label: 'Vender', emoji: '💰' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setPlan({ ...plan, content: { ...plan.content, purpose: option.value } })}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-all",
                                            plan.content.purpose === option.value
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-transparent border-border hover:bg-muted"
                                        )}
                                    >
                                        <span className="text-lg mb-1">{option.emoji}</span>
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Commercial */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                <Shield className="w-4 h-4" />
                            </div>
                            Comercial
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={plan.commercial.focusClear}
                                    onChange={(e) => setPlan({ ...plan, commercial: { ...plan.commercial, focusClear: e.target.checked } })}
                                    className="mt-1 rounded border-input bg-transparent text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                    O time sabe <span className="text-foreground font-medium">exatamente</span> o foco da semana?
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={plan.commercial.hasActiveActions}
                                    onChange={(e) => setPlan({ ...plan, commercial: { ...plan.commercial, hasActiveActions: e.target.checked } })}
                                    className="mt-1 rounded border-input bg-transparent text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                    Existe ação ativa de vendas? (Não só rotina)
                                </span>
                            </label>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer Action */}
            <div className="sticky bottom-4 z-10 pt-4">
                <Button
                    size="lg"
                    className="w-full shadow-2xl shadow-primary/30"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <Save className="w-5 h-5 mr-2 animate-pulse" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Salvar Planejamento
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
