'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, Plus, Trash2, AlertCircle, Target, Layers, ShoppingBag, Shield, RefreshCw } from 'lucide-react';
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
            <Card className="border-white/5 bg-card/40 backdrop-blur-xl">
                <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-8 bg-primary rounded-full" />
                            <div>
                                <CardTitle className="text-xl font-bold text-white">Semana Viva</CardTitle>
                                <CardDescription className="text-xs text-slate-500 font-medium">Direção da semana</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-black/40 rounded-full p-1 border border-white/5">
                            <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')} className="h-8 w-8 rounded-full hover:bg-white/10">
                                <ChevronLeft className="w-4 h-4 text-slate-400" />
                            </Button>
                            <span className="text-[10px] font-bold uppercase tracking-widest px-1 min-w-[120px] text-center text-muted-foreground">
                                {formatWeekRange(currentWeekStart)}
                            </span>
                            <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')} className="h-8 w-8 rounded-full hover:bg-white/10">
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
            <Card className="border-white/5 bg-card/40 blur-none">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-bold flex items-center gap-3 text-white">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
                            <Target className="w-4 h-4" />
                        </div>
                        Centro da Semana
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Se apenas UMA coisa avançar, qual será?</CardDescription>
                </CardHeader>
                <CardContent>
                    <Input
                        value={plan.centerOfWeek}
                        onChange={(e) => setPlan({ ...plan, centerOfWeek: e.target.value })}
                        placeholder="Ex: Lançar campanha de Black Friday..."
                        className="text-lg h-14 bg-black/20 border-white/5 rounded-xl placeholder:text-muted-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-0 text-white transition-all"
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
                                <div key={project.id} className="group bg-black/20 rounded-2xl p-5 space-y-4 border border-white/5 transition-all hover:bg-black/30 hover:border-white/10 shadow-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <Input
                                                value={project.name}
                                                onChange={(e) => updateProject(project.id, { name: e.target.value })}
                                                placeholder="Nome do projeto"
                                                className="bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto text-lg font-bold text-white placeholder:text-slate-700"
                                            />
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => removeProject(project.id)}
                                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm pt-2 border-t border-white/5">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={project.isAdvancing}
                                                onChange={(e) => updateProject(project.id, { isAdvancing: e.target.checked })}
                                                className="rounded border-input bg-transparent text-primary focus:ring-primary h-4 w-4"
                                            />
                                            <span className="text-slate-400 font-medium">Avançando</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Depende:</span>
                                            <select
                                                value={project.dependsOn}
                                                onChange={(e) => updateProject(project.id, { dependsOn: e.target.value as ProjectDependency })}
                                                className="bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer text-white"
                                            >
                                                <option value="me" className="bg-slate-900">Mim</option>
                                                <option value="others" className="bg-slate-900">Outros</option>
                                            </select>
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={project.nextStepClear}
                                                onChange={(e) => updateProject(project.id, { nextStepClear: e.target.checked })}
                                                className="rounded border-input bg-transparent text-primary focus:ring-primary h-4 w-4"
                                            />
                                            <span className="text-slate-400 font-medium">Próx. claro</span>
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
                <Card className="border-white/5 bg-card/40 backdrop-blur-xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-bold flex items-center gap-3 text-white">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
                                <ShoppingBag className="w-4 h-4" />
                            </div>
                            Conteúdo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tema Central</Label>
                            <Input
                                value={plan.content.theme}
                                onChange={(e) => setPlan({ ...plan, content: { ...plan.content, theme: e.target.value } })}
                                placeholder="Sobre o que vamos falar?"
                                className="bg-black/20 border-white/5 rounded-xl h-12 text-white placeholder:text-slate-700 focus-visible:ring-primary/50 focus-visible:ring-offset-0"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Objetivo Principal</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { value: 'grow' as ContentPurpose, label: 'Crescer', emoji: '📈' },
                                    { value: 'warm' as ContentPurpose, label: 'Aquecer', emoji: '🔥' },
                                    { value: 'sell' as ContentPurpose, label: 'Vender', emoji: '💰' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setPlan({ ...plan, content: { ...plan.content, purpose: option.value } })}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-2xl border text-[10px] font-bold uppercase tracking-tight transition-all",
                                            plan.content.purpose === option.value
                                                ? "bg-primary/20 border-primary shadow-lg shadow-primary/10 text-white"
                                                : "bg-black/20 border-white/5 hover:bg-white/5 text-slate-500"
                                        )}
                                    >
                                        <span className="text-xl mb-1.5">{option.emoji}</span>
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-white/5 bg-card/40 backdrop-blur-xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-bold flex items-center gap-3 text-white">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
                                <Shield className="w-4 h-4" />
                            </div>
                            Comercial
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <label className="flex items-start gap-4 cursor-pointer group p-3 rounded-xl hover:bg-white/5 transition-all outline outline-1 outline-transparent hover:outline-white/5">
                                <input
                                    type="checkbox"
                                    checked={plan.commercial.focusClear}
                                    onChange={(e) => setPlan({ ...plan, commercial: { ...plan.commercial, focusClear: e.target.checked } })}
                                    className="mt-1 rounded border-white/10 bg-black/40 text-primary focus:ring-primary h-5 w-5 transition-all"
                                />
                                <span className="text-sm text-muted-foreground group-hover:text-white transition-colors leading-relaxed">
                                    O time sabe <span className="text-primary font-bold">exatamente</span> o foco da semana?
                                </span>
                            </label>

                            <label className="flex items-start gap-4 cursor-pointer group p-3 rounded-xl hover:bg-white/5 transition-all outline outline-1 outline-transparent hover:outline-white/5">
                                <input
                                    type="checkbox"
                                    checked={plan.commercial.hasActiveActions}
                                    onChange={(e) => setPlan({ ...plan, commercial: { ...plan.commercial, hasActiveActions: e.target.checked } })}
                                    className="mt-1 rounded border-white/10 bg-black/40 text-primary focus:ring-primary h-5 w-5 transition-all"
                                />
                                <span className="text-sm text-muted-foreground group-hover:text-white transition-colors leading-relaxed">
                                    Existe ação ativa de vendas? <span className="text-slate-500 italic">(Não só rotina)</span>
                                </span>
                            </label>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer Action */}
            <div className="pt-4">
                <Button
                    size="lg"
                    className="w-full h-14 rounded-2xl text-sm font-bold bg-primary hover:bg-primary/90 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.5)] transition-all"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                            Sincronizando...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-3" />
                            Salvar Planejamento Estratégico
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
