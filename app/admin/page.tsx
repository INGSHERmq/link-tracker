'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, Users, Link as LinkIcon, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminDashboard() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)
            setLoading(false)
        }

        getUser()
    }, [router, supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        toast.success("Sesión cerrada correctamente")
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Cargando panel...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-indigo-500/30">
            {/* Header Premium */}
            <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <LinkIcon size={18} className="text-white" />
                        </div>
                        <h1 className="text-lg font-bold tracking-tight text-white">
                            Link Tracker <span className="text-neutral-500 font-normal ml-1">Admin</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-medium text-neutral-300">
                                {user?.email}
                            </span>
                        </div>
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            size="sm"
                            className="text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <LogOut size={16} className="mr-2" />
                            Salir
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-white">Panel de Control</h2>
                    <p className="text-neutral-400 text-lg">Gestiona el acceso y configuración de la plataforma.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Gestión de Usuarios */}
                    <Card
                        className="group relative bg-neutral-900/50 backdrop-blur-sm border-white/5 hover:border-indigo-500/50 transition-all duration-500 cursor-pointer overflow-hidden"
                        onClick={() => router.push('/admin/users')}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardHeader className="relative z-10 p-8 pb-4">
                            <div className="flex items-start gap-5">
                                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.15)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                    <Users size={28} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-bold text-white group-hover:text-indigo-50 transition-colors">Usuarios</CardTitle>
                                    <p className="text-neutral-400 text-sm leading-relaxed">Administra el acceso del personal y configura sus roles en el sistema.</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10 p-8 pt-6">
                            <div className="flex items-center text-sm font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
                                <span className="flex-1">Gestionar usuarios</span>
                                <UserPlus size={16} className="transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gestión de Links */}
                    <Card
                        className="group relative bg-neutral-900/50 backdrop-blur-sm border-white/5 hover:border-emerald-500/50 transition-all duration-500 cursor-pointer overflow-hidden"
                        onClick={() => router.push('/admin/links')}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardHeader className="relative z-10 p-8 pb-4">
                            <div className="flex items-start gap-5">
                                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                    <LinkIcon size={28} className="text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-bold text-white group-hover:text-emerald-50 transition-colors">Enlaces Oficiales</CardTitle>
                                    <p className="text-neutral-400 text-sm leading-relaxed">Publica y organiza los enlaces corporativos visibles para todo el personal.</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10 p-8 pt-6">
                            <div className="flex items-center text-sm font-medium text-emerald-400 group-hover:text-emerald-300 transition-colors">
                                <span className="flex-1">Gestionar enlaces</span>
                                <LinkIcon size={16} className="transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}