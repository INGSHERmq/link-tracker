import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            response.cookies.set(name, value, options)
                        })
                    } catch {
                        // Ignorar si hay error
                    }
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Si no hay usuario y quiere entrar a admin o a la página principal (/) → redirigir a login
    if (!user && (pathname.startsWith('/admin') || pathname === '/')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Si hay usuario, verificar rol y redirigir según corresponda
    if (user) {
        // Si está en login → redirigir según rol
        if (pathname === '/login') {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()


            const isAdmin = profile?.role === 'admin'

            if (isAdmin) {
                return NextResponse.redirect(new URL('/admin', request.url))
            } else {
                return NextResponse.redirect(new URL('/', request.url))
            }
        }

        // Si es usuario normal e intenta entrar a /admin → redirigir a home
        if (pathname.startsWith('/admin')) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'admin') {
                return NextResponse.redirect(new URL('/', request.url))
            }
        }
    }

    return response
}

export const config = {
    matcher: ['/admin/:path*', '/login', '/'],
}