'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: {
    email: string
    password: string
    full_name?: string
    role: 'user' | 'admin'
}) {
    const { email, password, full_name, role } = formData

    if (!email || !password) {
        throw new Error('Email y contraseña son obligatorios')
    }

    try {
        const serverSupabase = await createServerSupabase()
        const { data: { user: currentUser } } = await serverSupabase.auth.getUser()

        if (!currentUser) throw new Error('No autorizado')

        // Verificar que sea admin
        const { data: profile } = await serverSupabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single()

        if (profile?.role !== 'admin') {
            throw new Error('Solo los administradores pueden crear usuarios')
        }

        // Crear usuario en Supabase Auth
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email.trim().toLowerCase(),
            password,
            email_confirm: true,
        })

        if (createError) throw new Error(createError.message)

        // Crear perfil
        const { error: profileError } = await serverSupabase
            .from('profiles')
            .insert({
                id: newUser.user.id,
                role,
                full_name: full_name?.trim() || null,
            })

        if (profileError) throw new Error(profileError.message)

        revalidatePath('/admin/users')
        return { success: true, message: `Usuario ${email} creado correctamente como ${role}` }

    } catch (error: any) {
        console.error(error)
        throw new Error(error.message || 'Error al crear el usuario')
    }
}

export async function resetUserPassword(userId: string, newPassword: string) {
    try {
        const serverSupabase = await createServerSupabase()
        const { data: { user: currentUser } } = await serverSupabase.auth.getUser()

        if (!currentUser) throw new Error('No autorizado')

        const { data: profile } = await serverSupabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single()

        if (profile?.role !== 'admin') {
            throw new Error('Solo los administradores pueden resetear contraseñas')
        }

        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: newPassword,
        })

        if (error) throw new Error(error.message)

        revalidatePath('/admin/users')
        return { success: true, message: 'Contraseña reseteada correctamente' }

    } catch (error: any) {
        console.error(error)
        throw new Error(error.message || 'Error al resetear la contraseña')
    }
}

export async function getAdminUsers() {
    try {
        const serverSupabase = await createServerSupabase()
        const { data: { user: currentUser } } = await serverSupabase.auth.getUser()

        if (!currentUser) throw new Error('No autorizado')

        const { data: profile } = await serverSupabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single()

        if (profile?.role !== 'admin') {
            throw new Error('Solo los administradores pueden listar usuarios')
        }

        // Obtener perfiles
        const { data: profiles, error: profileError } = await serverSupabase
            .from('profiles')
            .select('id, role, full_name, created_at')
            .order('created_at', { ascending: false })

        if (profileError) throw new Error(profileError.message)

        // Obtener correos con Supabase Admin auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()

        if (authError) throw new Error(authError.message)

        const emailMap = new Map(
            authData.users.map((u: any) => [u.id, u.email])
        )

        const formattedUsers = profiles.map((p: any) => ({
            id: p.id,
            email: emailMap.get(p.id) || 'No disponible',
            full_name: p.full_name,
            role: p.role,
            created_at: p.created_at
        }))

        return formattedUsers
    } catch (error: any) {
        console.error("Error fetching users:", error)
        throw new Error(error.message || 'Error al obtener usuarios')
    }
}