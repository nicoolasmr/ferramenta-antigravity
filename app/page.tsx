'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent } from '@/components/ui/tabs';

// Layou Components
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardView } from '@/components/views/DashboardView';

// Views
import CheckDiario from '@/components/CheckDiario';
import SemanaViva from '@/components/SemanaViva';
import Impacto from '@/components/Impacto';
import NumerosAncora from '@/components/NumerosAncora';
import NumerosInteligencia from '@/components/NumerosInteligencia';
import AIChat from '@/components/AIChat';
import LiveStatus from '@/components/LiveStatus';
import Onboarding from '@/components/Onboarding';

// Hooks
import { useDashboardData } from '@/hooks/useDashboardData';
import { useRouter } from 'next/navigation';

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
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, showOnboarding, setShowOnboarding } = useDashboardData();

  // Default to 'comando' if no tab is present
  const activeTab = searchParams.get('tab') || 'comando';

  // Update URL when tab changes
  const setActiveTab = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', val);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in pb-20 font-sans selection:bg-primary/10 transition-colors duration-700">
      <div className="max-w-[1400px] mx-auto flex gap-8 pt-12 px-6">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

        {/* Main Workspace (Card Sheet) */}
        <main className="flex-1 min-h-[90vh] sheet p-12 relative overflow-hidden transition-colors duration-500">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

            <TabsContent value="comando" className="mt-0 focus-visible:outline-none animate-in fade-in zoom-in-95 duration-500">
              <div className="max-w-6xl mx-auto py-8 space-y-8">
                <div className="text-center space-y-4 mb-4">
                  <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight dark:text-white">Centro de Comando</h2>
                  <p className="text-slate-500 font-medium">Controle total. Operação sem peso.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Side: Live Monitors */}
                  <div className="lg:col-span-5 order-2 lg:order-1">
                    <div className="bg-white/50 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-xl">
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
              <DashboardView setActiveTab={setActiveTab} user={user} />
            </TabsContent>

            <TabsContent value="ritual" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-4xl mx-auto py-12">
                <div className="mb-12">
                  <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">O Rito</h2>
                  <p className="text-slate-500 font-medium">Sua consciência operacional diária</p>
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
                <div className="pt-10 border-t border-slate-100">
                  <h3 className="text-2xl font-extrabold text-slate-800 mb-8 border-l-4 border-primary pl-6">Conversa Estratégica</h3>
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

          <footer className="mt-24 pt-8 border-t border-slate-50 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-300 tracking-[0.3em]">
              © 2024 ANTIGRAVITY. Todos os direitos reservados.
            </p>
          </footer>
        </main>
      </div>

      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      </AnimatePresence>
    </div>
  );
}
