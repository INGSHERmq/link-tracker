'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, UserPlus, RefreshCw, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createUser, resetUserPassword, getAdminUsers } from '@/app/actions/userActions'

type Profile = {
    id: string
    email: string
    full_name: string | null
    role: 'user' | 'admin'
    created_at: string
}

export default function AdminUsers() {
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showResetModal, setShowResetModal] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [newPassword, setNewPassword] = useState('')

    // Form para crear usuario
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'user' as 'user' | 'admin'
    })

    const router = useRouter()
    const supabase = createClient()

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const usersData = await getAdminUsers()
            setUsers(usersData)
        } catch (error: any) {
            console.error("Error fetching users:", error)
            toast.error(error.message || 'Error al cargar usuarios')
            setUsers([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.email || !formData.password) {
            toast.error("Email y contraseña son obligatorios")
            return
        }

        try {
            const result = await createUser(formData)
            toast.success(result.message)
            setShowCreateModal(false)
            setFormData({ email: '', password: '', full_name: '', role: 'user' })
            fetchUsers()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const handleResetPassword = async () => {
        if (!selectedUserId || !newPassword) {
            toast.error("Ingrese una nueva contraseña")
            return
        }

        try {
            const result = await resetUserPassword(selectedUserId, newPassword)
            toast.success(result.message)
            setShowResetModal(false)
            setNewPassword('')
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-indigo-500/30 pb-12">
            {/* Header Minimalista */}
            <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/admin')}
                            className="text-neutral-400 hover:text-white hover:bg-white/5 -ml-3 transition-colors"
                        >
                            <ArrowLeft size={18} className="mr-2" />
                            Panel
                        </Button>
                        <div className="h-4 w-px bg-white/10 hidden sm:block" />
                        <h1 className="text-lg font-bold tracking-tight text-white hidden sm:block">Gestión de Usuarios</h1>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all border border-indigo-500/50"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Nuevo Usuario
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2 tracking-tight text-white">Directorio</h2>
                    <p className="text-neutral-400 font-medium">Administra los accesos y roles (Total: {users.length})</p>
                </div>

                <Card className="bg-neutral-900/50 backdrop-blur-sm border-white/5 shadow-2xl overflow-hidden">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-20 px-6">
                                <div className="w-16 h-16 bg-white/5 flex items-center justify-center rounded-full mx-auto mb-4">
                                    <Users size={24} className="text-neutral-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-1">Sin usuarios</h3>
                                <p className="text-neutral-400">Agrega el primer usuario administrativo al sistema.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left whitespace-nowrap">
                                    <thead className="text-xs text-neutral-400 uppercase bg-white/[0.02] border-b border-white/5">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Usuario</th>
                                            <th className="px-6 py-4 font-semibold">Rol</th>
                                            <th className="px-6 py-4 font-semibold">Registro</th>
                                            <th className="px-6 py-4 text-center font-semibold">Control</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-white">{user.full_name || 'Sin Nombre'}</div>
                                                    <div className="text-neutral-500 text-xs mt-0.5">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${user.role === 'admin'
                                                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        }`}>
                                                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-neutral-400">
                                                    {new Date(user.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedUserId(user.id)
                                                            setShowResetModal(true)
                                                        }}
                                                        className="text-neutral-400 hover:text-indigo-400 hover:bg-indigo-500/10"
                                                    >
                                                        <RefreshCw size={14} className="mr-2" />
                                                        Modificar Llave
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Modal Crear Usuario */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-md bg-neutral-900 border-white/10 shadow-2xl">
                        <CardHeader className="border-b border-white/5 pb-4">
                            <CardTitle className="text-xl font-bold text-white">Nuevo Integrante</CardTitle>
                            <CardDescription className="text-neutral-400">Completa los datos para dar acceso a la plataforma.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-neutral-300">Correo Electrónico</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="bg-neutral-950 border-white/10 focus-visible:ring-indigo-500 text-white"
                                        placeholder="ejemplo@organizacion.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-neutral-300">Contraseña Segura</Label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="bg-neutral-950 border-white/10 focus-visible:ring-indigo-500 text-white"
                                        placeholder="Min. 8 caracteres"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-neutral-300">Nombre Completo <span className="text-neutral-500 font-normal">(Opcional)</span></Label>
                                    <Input
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="bg-neutral-950 border-white/10 focus-visible:ring-indigo-500 text-white"
                                        placeholder="Juan Pérez"
                                    />
                                </div>
                                <div className="space-y-2 pt-1">
                                    <Label className="text-neutral-300">Nivel de Acceso</Label>
                                    <Select value={formData.role} onValueChange={(value: 'user' | 'admin') => setFormData({ ...formData, role: value })}>
                                        <SelectTrigger className="bg-neutral-950 border-white/10 text-white focus:ring-indigo-500">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-800 border-white/10 text-white">
                                            <SelectItem value="user" className="focus:bg-white/10 focus:text-white cursor-pointer">Usuario Estándar</SelectItem>
                                            <SelectItem value="admin" className="focus:bg-white/10 focus:text-white cursor-pointer">Configurador (Admin)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <Button type="button" variant="ghost" className="flex-1 text-neutral-400 hover:text-white hover:bg-white/5" onClick={() => setShowCreateModal(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white">
                                        Registrar
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal Resetear Contraseña */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-sm bg-neutral-900 border-white/10 shadow-2xl">
                        <CardHeader className="border-b border-white/5 pb-4">
                            <CardTitle className="text-xl font-bold text-white">Forzar Cambio de Llave</CardTitle>
                            <CardDescription className="text-neutral-400">Asigna una nueva clave temporal de acceso.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-neutral-300">Nueva Contraseña</Label>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="bg-neutral-950 border-white/10 focus-visible:ring-indigo-500 text-white"
                                        placeholder="Escribe la nueva clave..."
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button variant="ghost" className="flex-1 text-neutral-400 hover:text-white hover:bg-white/5" onClick={() => {
                                        setShowResetModal(false)
                                        setNewPassword('')
                                    }}>
                                        Ver Atrás
                                    </Button>
                                    <Button onClick={handleResetPassword} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white">
                                        Actualizar
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}