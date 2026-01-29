'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, TrendingUp, Award, Shield, Settings, LogOut, ChevronRight, User, Sparkles, Target, Brain, Heart, Search, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import CheckDiario from '@/components/CheckDiario'
import SemanaViva from '@/components/SemanaViva'
import Impacto from '@/components/Impacto'
import AlertasHumanos from '@/components/AlertasHumanos'
import NumerosAncora from '@/components/NumerosAncora'
import NumerosInteligencia from '@/components/NumerosInteligencia'
import AIChat from '@/components/AIChat'
import LiveStatus from '@/components/LiveStatus'
import Onboarding from '@/components/Onboarding'
import RitualHoje from '@/components/RitualHoje'
import SyncBadge from '@/components/SyncBadge'
import { createClient } from '@/lib/supabase/client'
import { syncEngine } from '@/lib/sync'
import { storage } from '@/lib/storage'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium text-sm">Carregando Centro de Comando...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const [user, setUser] = useState<any>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const supabase = createClient()

  // Default to 'comando' if no tab is present
  const activeTab = searchParams.get('tab') || 'comando'

  // Update URL when tab changes
  const setActiveTab = (val: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', val)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    // Sanitize session from other products
    if (typeof window !== 'undefined') {
      const ghostKeys = ['peck_session', 'pec-os-token', 'current_farm'];
      let cleared = false;
      ghostKeys.forEach(k => {
        if (localStorage.getItem(k)) {
          localStorage.removeItem(k);
          cleared = true;
        }
      });
      if (cleared) {
        console.log("Session sanitized: Residual data from other products removed.");
        window.location.reload();
      }
    }

    async function getUserAndSync() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Auto-pull latest data
        try {
          await syncEngine.pullRemoteToLocal(user.id)

          // Check onboarding status
          const prefs = storage.getPreferences()
          if (!prefs.onboardingCompleted) {
            setShowOnboarding(true)
          }
        } catch (e) {
          console.error("Auto-sync failed", e)
        }
      } else {
        // Guest mode, still check local storage
        const prefs = storage.getPreferences()
        if (!prefs.onboardingCompleted) {
          setShowOnboarding(true)
        }
      }
    }
    getUserAndSync()
  }, [])


  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in pb-20 font-sans selection:bg-primary/10 transition-colors duration-700">
      <div className="max-w-[1400px] mx-auto flex gap-8 pt-12 px-6">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 shrink-0 flex flex-col gap-10">
          <div className="px-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-purple-400/20 blur-[40px] rounded-full scale-150 -z-10" />
              <h1 className="text-xl font-bold tracking-tighter text-foreground title-glow uppercase">
                Antigravity
              </h1>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {[
              { label: 'Comando', value: 'comando', icon: Sparkles },
              { label: 'Painel', value: 'painel', icon: LayoutDashboard },
              { label: 'O Rito', value: 'ritual', icon: Target },
              { label: 'Números', value: 'numeros', icon: TrendingUp },
              { label: 'Progresso', value: 'semana', icon: Award },
              { label: 'Comunidade', value: 'impacto', icon: User }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-extrabold uppercase tracking-widest transition-all duration-300",
                  activeTab === tab.value
                    ? "text-primary bg-card/10 shadow-xl shadow-primary/5 ring-1 ring-white/10 translate-x-1"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <tab.icon className={cn("w-5 h-5", activeTab === tab.value ? "text-primary" : "text-slate-500")} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto px-4 pb-12">
            <div className="p-6 rounded-3xl bg-card/20 border border-white/5 shadow-sm space-y-4">
              <SyncBadge />
              <div className="pt-4 border-t border-white/5">
                {user ? (
                  <Button variant="ghost" className="w-full justify-start px-0 text-muted-foreground font-bold hover:text-primary hover:bg-transparent" onClick={() => router.push('/settings')}>
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

        {/* Main Workspace (Card Sheet) */}
        <main className="flex-1 min-h-[90vh] sheet p-12 relative overflow-hidden transition-colors duration-500 bg-card/30 backdrop-blur-3xl border-white/5">
          {/* Ambient Background Glow inside sheet if needed */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative z-10">

            <TabsContent value="comando" className="mt-0 focus-visible:outline-none animate-in fade-in zoom-in-95 duration-500">
              <div className="max-w-6xl mx-auto py-8 space-y-8">
                <div className="text-center space-y-4 mb-4">
                  <h2 className="text-4xl font-extrabold text-white tracking-tight title-glow">Centro de Comando</h2>
                  <p className="text-slate-400 font-medium">Controle total. Operação sem peso.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Side: Live Monitors */}
                  <div className="lg:col-span-5 order-2 lg:order-1">
                    <div className="bg-black/20 backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-xl">
                      <LiveStatus />
                    </div>
                  </div>

                  {/* Right Side: Master Chat */}
                  <div className="lg:col-span-7 order-1 lg:order-2">
                    <AIChat />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="painel" className="mt-0 focus-visible:outline-none animate-in fade-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Personal Dashboard */}
                <div className="lg:col-span-7 space-y-12">
                  <div className="bg-black/20 rounded-[2rem] p-10 border border-white/5 group hover:border-primary/20 transition-all duration-500">
                    <div className="mb-10 space-y-2">
                      <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        Olá, Sofia,
                      </h2>
                      <p className="text-lg text-slate-400 font-medium italic">
                        "Onde sua atenção flui, sua energia cresce."
                      </p>
                    </div>

                    <div className="space-y-10">
                      <div className="pt-8 border-t border-white/5">
                        <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-8">Estado de Fluxo</h3>

                        <div className="flex flex-wrap items-center gap-16">
                          {/* Dashboard Gauge (92%) */}
                          <div className="relative w-44 h-44 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="88" cy="88" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                              <circle cx="88" cy="88" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 * (1 - 0.92)} className="text-primary" />
                              <circle cx="88" cy="88" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={376} strokeDashoffset={376 * (1 - 0.75)} className="text-amber-200/20" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Balance</span>
                              <span className="text-3xl font-extrabold text-white">92%</span>
                            </div>
                          </div>

                          {/* Stats List */}
                          <div className="space-y-6">
                            {[
                              { label: 'Energia:', val: 'Alta', color: 'bg-amber-500/10 text-amber-500', icon: Sparkles },
                              { label: 'Foco:', val: 'Estável', color: 'bg-blue-500/10 text-blue-500', icon: Target },
                              { label: 'Bem-estar:', val: 'Excelente', color: 'bg-rose-500/10 text-rose-500', icon: Heart }
                            ].map((stat, i) => (
                              <div key={i} className="flex items-center gap-4 group/stat">
                                <div className={cn("p-2 rounded-xl transition-all group-hover/stat:scale-110", stat.color)}>
                                  <stat.icon className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                                  <span className="text-sm font-extrabold text-slate-200">{stat.val}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Sessions Preview */}
                      <div className="pt-10 border-t border-white/5">
                        <div className="space-y-6">
                          <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Sessões Recomendadas</h3>
                          <div className="space-y-4">
                            {[
                              { date: 'Hoje', title: 'Meditação Guiada' },
                              { date: 'Amanhã', title: 'Workshop de Equilíbrio' }
                            ].map((session, i) => (
                              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group/session hover:border-primary/30 transition-all">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary font-bold text-xs">
                                  {session.date}
                                </div>
                                <span className="text-sm font-bold text-slate-300">{session.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Ritual Progress */}
                <div className="lg:col-span-5 space-y-10">
                  <div className="bg-black/20 rounded-[2rem] p-10 shadow-sm border border-white/5">
                    <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-8">Compromisso de Hoje</h3>
                    <RitualHoje onNavigate={setActiveTab} />
                  </div>

                  <div className="bg-black/20 rounded-[2rem] p-10 shadow-sm border border-white/5">
                    <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-8">Atividades Recentes</h3>
                    <div className="space-y-8">
                      {[
                        { label: 'Leitura Concluída:', val: 'A Arte do Fluxo', icon: Brain, color: 'text-amber-500 bg-amber-500/10' },
                        { label: 'Diário Atualizado:', val: 'Reflexão Matinal', icon: Sparkles, color: 'text-purple-500 bg-purple-500/10' }
                      ].map((activity, i) => (
                        <div key={i} className="flex items-center gap-5 group/act">
                          <div className={cn("p-3 rounded-2xl transition-transform group-hover/act:scale-110", activity.color)}>
                            <activity.icon className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-500 tracking-tight">{activity.label}</span>
                            <span className="text-sm font-extrabold text-slate-200">{activity.val}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ritual" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-4xl mx-auto py-12">
                <div className="mb-12">
                  <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">O Rito</h2>
                  <p className="text-slate-400 font-medium">Sua consciência operacional diária</p>
                </div>
                <CheckDiario />
              </div>
            </TabsContent>

            <TabsContent value="numeros" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="py-8">
                <NumerosAncora />
              </div>
            </TabsContent>

            <TabsContent value="estrategia" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-5xl mx-auto space-y-12 py-8">
                <NumerosInteligencia />
                <div className="pt-10 border-t border-white/5">
                  <h3 className="text-2xl font-extrabold text-white mb-8 border-l-4 border-primary pl-6">Conversa Estratégica</h3>
                  <AIChat />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="semana" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SemanaViva />
            </TabsContent>

            <TabsContent value="impacto" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Impacto />
            </TabsContent>
          </Tabs>

          <footer className="mt-24 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.3em]">
              © 2024 ANTIGRAVITY. Todos os direitos reservados.
            </p>
          </footer>
        </main>
      </div>

      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      </AnimatePresence>
    </div>
  )
}
