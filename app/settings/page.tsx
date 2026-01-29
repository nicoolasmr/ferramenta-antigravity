'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BadgeStatus } from '@/components/ui/badge-status'
import { Loader2, LogOut, Save, Download, Upload, RefreshCw } from 'lucide-react'
import { storage } from '@/lib/storage'
import { syncEngine } from '@/lib/sync'
import { useToast } from '@/components/ui/use-toast'

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')
    const { toast } = useToast()
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }
        getUser()
    }, [])

    async function handleSignOut() {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    async function handleSync() {
        if (!user) return
        setSyncing(true)
        toast("Sincronizando dados...", "loading")

        try {
            // 1. Push Local -> Remote
            await syncEngine.pushLocalToRemote(user.id)

            // 2. Pull Remote -> Local
            await syncEngine.pullRemoteToLocal(user.id)

            // Force reload to reflect changes
            router.refresh()
            toast("Sincronização concluída!", "success")
        } catch (error) {
            console.error('Sync failed', error)
            toast("Erro ao sincronizar.", "error")
        } finally {
            setSyncing(false)
        }
    }

    // Export Data (JSON)
    const handleExport = () => {
        const data = {
            dailyChecks: storage.getDailyChecks(),
            weeklyPlans: storage.getWeeklyPlans(),
            impactLogs: storage.getImpactLogs(),
            dismissedAlerts: storage.getDismissedAlerts(),
            exportDate: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `antigravity-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast("Backup exportado com sucesso!", "success")
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container-wide py-8 space-y-8 animate-fade-in relative pb-32">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
                        Configurações
                    </h1>
                    <p className="text-muted-foreground mt-1">Ajuste seu centro de gravidade.</p>
                </div>
                <Button variant="ghost" onClick={() => router.push('/')}>
                    Voltar para o Início
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
                    <TabsTrigger value="preferences">Preferências</TabsTrigger>
                    <TabsTrigger value="security">Segurança</TabsTrigger>
                    <TabsTrigger value="data">Dados</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Perfil de Usuário</CardTitle>
                            <CardDescription>
                                Informações básicas da sua conta.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input disabled value={user?.email || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label>Nome Completo</Label>
                                <Input placeholder="Seu nome" defaultValue={user?.user_metadata?.full_name || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label>Fuso Horário</Label>
                                <Input disabled value="America/Sao_Paulo (Padrão)" />
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between">
                            <Button variant="outline" onClick={handleSignOut} className="text-destructive hover:text-destructive">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sair da Conta
                            </Button>
                            <Button onClick={() => toast("Perfil salvo! (Placeholder)", "success")}>
                                <Save className="w-4 h-4 mr-2" />
                                Salvar Alterações
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferências do Sistema</CardTitle>
                            <CardDescription>
                                Personalize sua experiência no ANTIGRAVITY.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Modo Alto Contraste</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Aumenta a distinção entre elementos visuais.
                                    </p>
                                </div>
                                <div className="h-6 w-11 bg-muted rounded-full relative cursor-not-allowed opacity-50">
                                    <div className="h-4 w-4 bg-background rounded-full absolute top-1 left-1" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Fluxo de Introdução</Label>
                                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="font-medium">Onboarding Antigravity</div>
                                        <div className="text-xs text-muted-foreground">Revisar os conceitos base da ferramenta.</div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => {
                                        const prefs = storage.getPreferences();
                                        storage.savePreferences({ ...prefs, onboardingCompleted: false });
                                        toast("Onboarding resetado! Volte ao início para ver.", "success");
                                    }}>
                                        Rever Onboarding
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => toast("Preferências salvas!", "success")}>
                                <Save className="w-4 h-4 mr-2" />
                                Salvar Preferências
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Segurança</CardTitle>
                            <CardDescription>
                                Gerencie sua senha e acesso.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-sm">
                                Para alterar sua senha, enviaremos um link de redefinição para seu email.
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="secondary" onClick={() => toast("Link enviado para seu email!", "success")}>
                                Enviar Link de Redefinição
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="data" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados & Sincronização</CardTitle>
                            <CardDescription>
                                Seus dados pertencem a você. Exporte, importe ou sincronize.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button variant="secondary" onClick={handleExport} className="h-24 flex flex-col gap-2 hover:bg-secondary/80 transition-all hover:scale-[1.02]">
                                        <Download className="w-6 h-6 text-primary" />
                                        <span>Exportar Backup (JSON)</span>
                                    </Button>
                                    <div className="relative">
                                        <Input
                                            type="file"
                                            accept=".json"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (e) => {
                                                        try {
                                                            const json = JSON.parse(e.target?.result as string);
                                                            if (json.dailyChecks) json.dailyChecks.forEach((c: any) => storage.saveDailyCheck(c));
                                                            if (json.weeklyPlans) json.weeklyPlans.forEach((c: any) => storage.saveWeeklyPlan(c));
                                                            if (json.impactLogs) json.impactLogs.forEach((c: any) => storage.saveImpactLog(c));
                                                            if (json.dismissedAlerts) json.dismissedAlerts.forEach((c: any) => storage.dismissAlert(c));
                                                            toast("Dados importados com sucesso! Atualize a página.", "success");
                                                            setTimeout(() => window.location.reload(), 1500);
                                                        } catch (err) {
                                                            toast("Erro ao ler arquivo de backup.", "error");
                                                        }
                                                    };
                                                    reader.readAsText(file);
                                                }
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer h-full z-10"
                                        />
                                        <Button variant="secondary" className="h-24 flex flex-col gap-2 w-full hover:bg-secondary/80 transition-all hover:scale-[1.02]">
                                            <Upload className="w-6 h-6 text-primary" />
                                            <span>Importar Backup</span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-gradient-to-br from-secondary/50 to-secondary/10 p-6 border border-white/5 mt-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <RefreshCw className="w-24 h-24 rotate-12" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-lg">Nuvem Antigravity</span>
                                            <BadgeStatus variant="success" icon="check">Conectado</BadgeStatus>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-6 max-w-md">
                                            Seus dados são salvos automaticamente no banco de dados seguro do Supabase sempre que você estiver online.
                                        </p>
                                        <Button onClick={handleSync} disabled={syncing} className="w-full sm:w-auto min-w-[200px] shadow-lg shadow-primary/20">
                                            {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                            {syncing ? 'Sincronizando...' : 'Forçar Sincronização Agora'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
