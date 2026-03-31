'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, ExternalLink, Search, ChevronLeft, ChevronRight, LogIn } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import dynamic from 'next/dynamic'

const Car3DBackground = dynamic(() => import('@/components/Car3DBackground'), { ssr: false })

type Link = {
  id: string
  title: string
  description: string | null
  url: string
  image_url: string | null
}

export default function Home() {
  const [links, setLinks] = useState<Link[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  const filteredLinks = links.filter((link) =>
    link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (link.description && link.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalPages = Math.ceil(filteredLinks.length / itemsPerPage)

  const paginatedLinks = filteredLinks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const supabase = createClient()

  useEffect(() => {
    const getUserAndLinks = async () => {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Obtener enlaces
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
      } else {
        setLinks(data || [])
      }
      setLoading(false)
    }

    getUserAndLinks()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success("Sesión cerrada correctamente")
    window.location.href = '/login'   // Redirigir a login después de logout
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header flotante con cristal esmerilado */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <ExternalLink size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Info Car</h1>
          </div>

          {user ? (
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <LogOut size={18} className="mr-2" />
              Cerrar Sesión
            </Button>
          ) : (
            <Button
              onClick={() => window.location.href = '/login'}
              variant="ghost"
              className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <LogIn size={18} className="mr-2" />
              Iniciar Sesión
            </Button>
          )}
        </div>
      </header>

      {/* Sección interactiva 3D del automóvil */}
      <div className="relative w-full h-[400px] md:h-[500px] bg-gradient-to-b from-slate-100 to-slate-50 border-b border-slate-200/50 overflow-hidden">

        {/* Título sobrepuesto */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-6 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight drop-shadow-md">
            Todo <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">En un solo lugar</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-sm bg-white/40 backdrop-blur-sm rounded-xl py-2 px-4 inline-block">
            Accede de forma rápida y centralizada a todas las plataformas autorizadas por la organización.
          </p>
        </div>

        <Car3DBackground />
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        {/* Buscador */}
        <div className="max-w-2xl mx-auto mb-12 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Search size={22} />
          </div>
          <Input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white border-slate-200/60 shadow-sm rounded-2xl text-lg focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Grid de Tarjetas */}
        {filteredLinks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {paginatedLinks.map((link) => (
                <Card key={link.id} className="group overflow-hidden border-slate-200/60 bg-white hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-500 flex flex-col h-full">
                  {link.image_url && (
                    <div className="relative h-56 w-full overflow-hidden bg-slate-100 border-b border-slate-100/50 shrink-0">
                      <Image
                        src={link.image_url}
                        alt={link.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  )}

                  <CardHeader className="p-6 pb-4">
                    <CardTitle className="line-clamp-1 text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-300">
                      {link.title}
                    </CardTitle>
                    {link.description && (
                      <CardDescription className="line-clamp-2 mt-2 text-slate-500 text-sm leading-relaxed min-h-[40px]">
                        {link.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="p-6 pt-0 mt-auto">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full bg-slate-900 hover:bg-indigo-600 text-white text-center py-3.5 px-4 rounded-xl font-medium transition-all duration-300 items-center justify-center gap-2 shadow-sm hover:shadow-indigo-500/25 ring-1 ring-inset ring-slate-900/10 hover:ring-indigo-600"
                    >
                      <span>Ir al sitio</span>
                      <ExternalLink size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-px" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-slate-200 hover:bg-slate-100 hover:text-slate-900 h-11 w-11 shadow-sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={18} />
                </Button>
                <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-sm font-semibold text-slate-900 min-w-[1.5rem] text-center">
                    {currentPage}
                  </span>
                  <span className="text-sm text-slate-400">/</span>
                  <span className="text-sm font-medium text-slate-500 min-w-[1.5rem] text-center">
                    {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-slate-200 hover:bg-slate-100 hover:text-slate-900 h-11 w-11 shadow-sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200/60 shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Search size={24} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No se encontraron enlaces</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Intenta con otros términos de búsqueda o verifica que haya enlaces públicos disponibles.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}