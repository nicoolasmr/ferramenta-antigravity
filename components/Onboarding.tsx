'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Shield, Rocket, Info, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface OnboardingProps {
    onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(1);
    const [useDemoData, setUseDemoData] = useState(false);
    const supabase = createClient();

    const nextStep = () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        // Save flag locally
        const prefs = storage.getPreferences();
        storage.savePreferences({ ...prefs, onboardingCompleted: true });

        // Sync to Supabase if logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('preferences').upsert({
                user_id: user.id,
                payload: { ...prefs, onboardingCompleted: true },
                updated_at: new Date().toISOString()
            });
        }

        if (useDemoData) {
            // Logic to inject demo data could go here (out of scope for now, just a flag)
            console.log("Demo mode activated");
        }

        onComplete();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 1.05 }}
                    className="w-full max-w-lg"
                >
                    <Card className="border-primary/20 shadow-2xl bg-secondary/20 overflow-hidden">
                        <CardContent className="p-8 space-y-8">
                            {/* Progress bar */}
                            <div className="flex gap-2 mb-8">
                                {[1, 2, 3, 4].map(s => (
                                    <div
                                        key={s}
                                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-muted'}`}
                                    />
                                ))}
                            </div>

                            {step === 1 && (
                                <div className="space-y-6 pt-4">
                                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                                        <Rocket className="w-8 h-8 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold tracking-tight">O Centro de Gravidade</h2>
                                        <p className="text-muted-foreground text-lg">O que mantém tudo em pé passa por aqui.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-emerald-500" />
                                            </div>
                                            <p className="text-sm">Check rápido do dia (Manhã e Fim do dia)</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-emerald-500" />
                                            </div>
                                            <p className="text-sm">Foco semanal claro com o Semana Viva</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-emerald-500" />
                                            </div>
                                            <p className="text-sm">Números Âncora + Radar de Vermelhos</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 pt-4">
                                    <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                                        <Info className="w-8 h-8 text-amber-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold tracking-tight">Como usar sem peso</h2>
                                        <p className="text-muted-foreground text-lg italic">"Sem culpa. Só clareza."</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="p-4 bg-background/40 rounded-xl border border-border/50">
                                            <p className="text-xs uppercase tracking-wider font-bold text-primary mb-1">Manhã (2 min)</p>
                                            <p className="text-sm font-medium">Atualizar seus Números Âncora</p>
                                        </div>
                                        <div className="p-4 bg-background/40 rounded-xl border border-border/50">
                                            <p className="text-xs uppercase tracking-wider font-bold text-primary mb-1">Fim do dia (5 min)</p>
                                            <p className="text-sm font-medium">Fazer o Check Diário Antigravity</p>
                                        </div>
                                        <div className="p-4 bg-background/40 rounded-xl border border-border/50">
                                            <p className="text-xs uppercase tracking-wider font-bold text-primary mb-1">Segunda (20 min)</p>
                                            <p className="text-sm font-medium">Definir seu Semana Viva</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 pt-4">
                                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                                        <Shield className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold tracking-tight">Privacidade & Controle</h2>
                                        <p className="text-muted-foreground text-lg">Seus dados são seus por direito.</p>
                                    </div>
                                    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                                        <p>O Antigravity prioriza o armazenamento local. Seus dados nunca saem do seu dispositivo sem sua permissão.</p>
                                        <p>A sincronização com a nuvem é opcional e serve para garantir que você não perca nada ao trocar de aparelho.</p>
                                        <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                                            Ferramentas de Importação/Exportação estão sempre disponíveis nas configurações.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-8 pt-4">
                                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                                        <Play className="w-8 h-8 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold tracking-tight">Tudo pronto.</h2>
                                        <p className="text-muted-foreground text-lg">Inicie sua jornada para a clareza total.</p>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                        <input
                                            type="checkbox"
                                            id="demo-mode"
                                            checked={useDemoData}
                                            onChange={e => setUseDemoData(e.target.checked)}
                                            className="w-4 h-4 rounded border-primary/20 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="demo-mode" className="text-sm font-medium cursor-pointer">
                                            Ativar modo demo (dados de exemplo para exploração)
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex items-center justify-between gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => step > 1 ? setStep(step - 1) : null}
                                    className={cn(step === 1 && "invisible")}
                                >
                                    Voltar
                                </Button>
                                <Button
                                    className="px-8 py-6 text-lg group"
                                    onClick={nextStep}
                                >
                                    {step === 4 ? 'Começar Agora' : 'Próximo'}
                                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
