'use client'

import { createUser } from '@/app/actions/userActions'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'

export default function CreateFirstAdmin() {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            const result = await createUser(formData)
            toast.success("¡Usuario creado!", {
                description: result.message,
            })

            // Redirigir al login después de crear el usuario
            setTimeout(() => {
                window.location.href = '/login'
            }, 1500)

        } catch (error: any) {
            toast.error("Error", {
                description: error.message,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <UserPlus className="w-12 h-12 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl text-center">Crear Primer Administrador</CardTitle>
                    <p className="text-center text-gray-600">
                        Este será tu usuario principal de administrador
                    </p>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Correo electrónico</Label>
                            <Input
                                name="email"
                                type="email"
                                placeholder="admin@tuempresa.com"
                                required
                            />
                        </div>

                        <div>
                            <Label>Contraseña</Label>
                            <Input
                                name="password"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                        </div>

                        <div>
                            <Label>Nombre completo (opcional)</Label>
                            <Input
                                name="full_name"
                                placeholder="Sher Jhair"
                            />
                        </div>

                        <div>
                            <Label>Rol</Label>
                            <select name="role" className="w-full p-3 border rounded-md" defaultValue="admin" required>
                                <option value="admin">Administrador</option>
                                <option value="user">Usuario normal</option>
                            </select>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creando usuario..." : "Crear Administrador"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}