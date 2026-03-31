'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) {
            toast.error("Por favor completa todos los campos")
            return
        }

        setLoading(true)

        try {
            const supabase = createClient()

            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            })

            if (error) {
                toast.error("Error al iniciar sesión", {
                    description: error.message,
                })
            } else {
                toast.success("¡Bienvenido!", {
                    description: "Redirigiendo al panel administrativo...",
                })
                router.refresh()
            }
        } catch (err) {
            toast.error("Ocurrió un error inesperado")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-6 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Elementos decorativos abstractos */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <Card className="w-full max-w-md shadow-2xl shadow-indigo-900/5 border-slate-200/60 bg-white/80 backdrop-blur-xl relative z-10">
                <CardHeader className="space-y-6 text-center pt-8 pb-4">
                    <div className="mx-auto bg-indigo-600 text-white p-4 rounded-2xl w-fit shadow-lg shadow-indigo-600/20 transform -translate-y-2">
                        <LogIn size={32} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Info Car
                        </CardTitle>
                        <CardDescription className="text-base text-slate-500 font-medium">
                            Panel Administrativo
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-medium ml-1">
                                Correo electrónico
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@tuempresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="h-12 bg-white/50 border-slate-200 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 transition-shadow"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700 font-medium ml-1">
                                Contraseña
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="h-12 bg-white/50 border-slate-200 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 transition-shadow"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-indigo-600 text-white transition-all duration-300 shadow-md hover:shadow-indigo-500/25 mt-2"
                            disabled={loading}
                        >
                            {loading ? "Verificando credenciales..." : "Iniciar Sesión"}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center">
                        <p className="text-sm text-slate-400 font-medium">
                            Solo el administrador puede crear cuentas
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}