'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, LayoutDashboard, Target, TrendingUp, Award, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SyncBadge from '@/components/SyncBadge';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    user: any;
}

export function Sidebar({ activeTab, setActiveTab, user }: SidebarProps) {
    const router = useRouter();

    const tabs = [
        { label: 'Comando', value: 'comando', icon: Sparkles },
        { label: 'Painel', value: 'painel', icon: LayoutDashboard },
        { label: 'O Rito', value: 'ritual', icon: Target },
        { label: 'Números', value: 'numeros', icon: TrendingUp },
        { label: 'Progresso', value: 'semana', icon: Award },
        { label: 'Comunidade', value: 'impacto', icon: User }
    ];

    return (
        <aside className="w-64 shrink-0 flex flex-col gap-10">
            <div className="px-4">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-pink-500/30 to-primary/30 blur-[50px] rounded-full scale-150 -z-10 animate-pulse-glow" />
                    <h1 className="text-xl font-bold tracking-tighter text-foreground title-glow uppercase">
                        Antigravity
                    </h1>
                </div>
            </div>

            <nav className="flex flex-col gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={cn(
                            "flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-extrabold uppercase tracking-widest transition-all duration-300",
                            activeTab === tab.value
                                ? "text-white bg-gradient-to-r from-primary to-pink-500 shadow-glow-primary ring-1 ring-primary/50 translate-x-1 scale-105"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5 hover:scale-102"
                        )}
                    >
                        <tab.icon className={cn("w-5 h-5 transition-transform", activeTab === tab.value ? "text-white scale-110" : "text-slate-400")} />
                        {tab.label}
                    </button>
                ))}
            </nav>

            <div className="mt-auto px-4 pb-12">
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                    <SyncBadge />
                    <div className="pt-4 border-t border-border">
                        {user ? (
                            <Button variant="ghost" className="w-full justify-start px-0 text-muted-foreground font-bold hover:text-primary" onClick={() => router.push('/settings')}>
                                <Settings className="w-4 h-4 mr-3" />
                                Configurações
                            </Button>
                        ) : (
                            <Button size="sm" onClick={() => router.push('/login')} className="w-full rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20 transition-all">
                                Entrar
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}
