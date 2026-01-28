'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, LogOut, Save, Download, Upload, RefreshCw } from 'lucide-react'
import { storage } from '@/lib/storage'

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
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
        setSyncing(true)
        // Placeholder for sync logic
        await new Promise(resolve => setTimeout(resolve, 1500))
        setSyncing(false)
        // Show success toast here
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
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container-wide py-8 space-y-8 animate-fade-in relative">
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

            <Tabs defaultValue="profile" className="w-full">
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
                            <Button>
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
                                {/* Switch toggle placeholder */}
                                <div className="h-6 w-11 bg-muted rounded-full relative cursor-not-allowed opacity-50">
                                    <div className="h-4 w-4 bg-background rounded-full absolute top-1 left-1" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Densidade de Interface</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 border-2 border-primary bg-primary/5 rounded-xl cursor-pointer">
                                        <div className="font-medium text-primary mb-1">Confortável</div>
                                        <div className="text-xs text-muted-foreground">Espaçamento generoso, foco e calma.</div>
                                    </div>
                                    <div className="p-4 border border-border hover:bg-accent rounded-xl cursor-pointer opacity-50">
                                        <div className="font-medium mb-1">Compacta</div>
                                        <div className="text-xs text-muted-foreground">Mais informação por tela. (Em breve)</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button disabled>
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
                            <Button variant="secondary">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button variant="secondary" onClick={handleExport} className="h-24 flex flex-col gap-2">
                                    <Download className="w-6 h-6" />
                                    <span>Exportar Backup (JSON)</span>
                                </Button>
                                <Button variant="secondary" className="h-24 flex flex-col gap-2 opacity-50 cursor-not-allowed">
                                    <Upload className="w-6 h-6" />
                                    <span>Importar Backup</span>
                                </Button>
                            </div>

                            <div className="rounded-xl bg-secondary/30 p-4 border border-border mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">Status da Sincronização</span>
                                    <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                                        Conectado
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Seus dados estão sendo salvos automaticamente no banco de dados seguro do Supabase.
                                </p>
                                <Button onClick={handleSync} disabled={syncing} variant="outline" className="w-full">
                                    {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                    {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
