'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('login')

    const router = useRouter()
    const supabase = createClient()

    async function handleSignIn(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                setError("Não deu certo. Confere o email e a senha e tenta de novo.")
                return
            }

            router.refresh()
            router.push('/')
        } catch (err) {
            setError('Ocorreu um erro inesperado.')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleSignUp(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            })

            if (error) {
                setError(error.message)
                return
            }

            setMessage("Conta criada! Verifique seu email para confirmar.")
        } catch (err) {
            setError('Ocorreu um erro inesperado.')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${location.origin}/auth/callback?next=/settings/reset-password`,
            })

            if (error) {
                setError(error.message)
                return
            }

            setMessage("Vamos te mandar um link para redefinir a senha.")
        } catch (err) {
            setError('Ocorreu um erro inesperado.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="hidden bg-slate-900 lg:flex flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent mb-2">
                        ANTIGRAVITY
                    </h1>
                    <p className="text-xl text-slate-300 font-light">Centro de Gravidade</p>
                </div>

                <div className="relative z-10 space-y-6">
                    <blockquote className="space-y-2">
                        <p className="text-lg text-slate-200 leading-relaxed">
                            "Um sistema criado para sustentar quem sustenta o negócio. Sem ruído, sem culpa, apenas clareza."
                        </p>
                    </blockquote>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Consciência diária da operação</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Direção clara para a semana</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span>Prova de valor e impacto</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex items-center justify-center p-6 bg-background">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center lg:hidden mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
                            ANTIGRAVITY
                        </h1>
                        <p className="text-muted-foreground mt-2">Clareza diária, sem peso mental.</p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login">Entrar</TabsTrigger>
                            <TabsTrigger value="register">Criar Conta</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Entrar</CardTitle>
                                    <CardDescription>
                                        Bem-vindo de volta ao seu centro de gravidade.
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={handleSignIn}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="nome@exemplo.com"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password">Senha</Label>
                                                <button
                                                    type="button"
                                                    onClick={handleResetPassword}
                                                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                                >
                                                    Esqueci minha senha
                                                </button>
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                        {error && (
                                            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                                                {error}
                                            </div>
                                        )}
                                        {message && (
                                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm rounded-lg">
                                                {message}
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full" type="submit" disabled={isLoading}>
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Entrar
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>

                        <TabsContent value="register">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Criar Conta</CardTitle>
                                    <CardDescription>
                                        Comece a organizar sua operação hoje.
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={handleSignUp}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-email">Email</Label>
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                placeholder="nome@exemplo.com"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-password">Senha</Label>
                                            <Input
                                                id="signup-password"
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                        {error && (
                                            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                                                {error}
                                            </div>
                                        )}
                                        {message && (
                                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm rounded-lg">
                                                {message}
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant="outline" className="w-full" type="submit" disabled={isLoading}>
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Criar Conta
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
