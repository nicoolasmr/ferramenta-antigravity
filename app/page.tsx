'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, TrendingUp, Award, Shield, Settings, LogOut, ChevronRight, User, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import CheckDiario from '@/components/CheckDiario'
import SemanaViva from '@/components/SemanaViva'
import Impacto from '@/components/Impacto'
import AlertasHumanos from '@/components/AlertasHumanos'
import NumerosAncora from '@/components/NumerosAncora'
import NumerosInteligencia from '@/components/NumerosInteligencia'
import Onboarding from '@/components/Onboarding'
import RitualHoje from '@/components/RitualHoje'
import SyncBadge from '@/components/SyncBadge'
import { createClient } from '@/lib/supabase/client'
import { syncEngine } from '@/lib/sync'
import { storage } from '@/lib/storage'


export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('check')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
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
    <div className="min-h-screen bg-background text-foreground animate-fade-in pb-20">
      {/* Background Ambience */}
      <div className="decorative-circle decorative-circle-1" />
      <div className="decorative-circle decorative-circle-2" />

      <div className="container-wide pt-6 md:pt-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">
              ANTIGRAVITY
            </h1>
            <p className="text-muted-foreground text-lg">
              Centro de Gravidade
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SyncBadge />
            {user ? (
              <div className="flex items-center gap-3 bg-secondary/50 backdrop-blur-md p-2 rounded-full border border-white/5 pl-4">
                <span className="text-sm font-medium hidden md:block">
                  {user.email}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full h-8 w-8 hover:bg-white/10"
                  onClick={() => router.push('/settings')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={() => router.push('/login')}>
                Entrar
              </Button>
            )}
          </div>
        </header>

        {/* Ritual Area */}
        <section className="mb-12">
          <RitualHoje onNavigate={setActiveTab} />
        </section>

        {/* Main Content */}
        <Tabs key={user ? 'logged-in' : 'guest'} value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">

          <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide">
            <TabsList className="bg-secondary/50 backdrop-blur-md border border-white/5 p-1 h-auto flex-nowrap w-full md:w-auto overflow-visible gap-1 justify-start">
              <TabsTrigger value="inteligencia" className="px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Sparkles className="w-4 h-4 mr-2" />
                Inteligência
              </TabsTrigger>
              <TabsTrigger value="check" className="px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                Check Diário
              </TabsTrigger>
              <TabsTrigger value="semana" className="px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <TrendingUp className="w-4 h-4 mr-2" />
                Semana Viva
              </TabsTrigger>
              <TabsTrigger value="numeros" className="px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <TrendingUp className="w-4 h-4 mr-2" />
                Números
              </TabsTrigger>
              <TabsTrigger value="impacto" className="px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Award className="w-4 h-4 mr-2" />
                Impacto
              </TabsTrigger>
              <TabsTrigger value="alertas" className="px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Shield className="w-4 h-4 mr-2" />
                Alertas
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="inteligencia">
            <NumerosInteligencia />
          </TabsContent>
          <TabsContent value="check">
            <CheckDiario />
          </TabsContent>
          <TabsContent value="semana">
            <SemanaViva />
          </TabsContent>
          <TabsContent value="numeros">
            <NumerosAncora />
          </TabsContent>
          <TabsContent value="impacto">
            <Impacto />
          </TabsContent>
          <TabsContent value="alertas">
            <AlertasHumanos />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-20 py-8 border-t border-border/50 text-center text-muted-foreground text-sm">
          <p>© 2026 Antigravity System. Sustentando quem sustenta.</p>
        </footer>
      </div>

      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      </AnimatePresence>
    </div>
  )
}
