'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import Image from 'next/image'
import { ArrowLeft, Plus, Trash2, LinkIcon, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Link = {
    id: string
    title: string
    description: string | null
    url: string
    image_url: string | null
    created_at: string
}

export default function AdminLinks() {
    const [links, setLinks] = useState<Link[]>([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showForm, setShowForm] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [url, setUrl] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    const fetchLinks = async () => {
        const { data, error } = await supabase
            .from('links')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            toast.error('Error al cargar enlaces')
        } else {
            setLinks(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchLinks()
    }, [])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !url) {
            toast.error("Título y URL son obligatorios")
            return
        }

        setIsSubmitting(true)

        try {
            let imageUrl: string | null = null

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('link-images')
                    .upload(fileName, imageFile, { upsert: true })

                if (uploadError) throw uploadError

                const { data: urlData } = supabase.storage
                    .from('link-images')
                    .getPublicUrl(fileName)

                imageUrl = urlData.publicUrl
            }

            const { error } = await supabase
                .from('links')
                .insert({
                    title: title.trim(),
                    description: description.trim() || null,
                    url: url.trim(),
                    image_url: imageUrl,
                })

            if (error) throw error

            toast.success("¡Enlace creado correctamente!")

            // Limpiar formulario
            setTitle('')
            setDescription('')
            setUrl('')
            setImageFile(null)
            setPreviewUrl(null)
            setShowForm(false)

            fetchLinks()

        } catch (error: any) {
            toast.error("Error al crear el enlace", {
                description: error.message || "Inténtalo nuevamente"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const deleteLink = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este enlace?")) return

        const { error } = await supabase
            .from('links')
            .delete()
            .eq('id', id)

        if (error) {
            toast.error("No se pudo eliminar el enlace")
        } else {
            toast.success("Enlace eliminado")
            fetchLinks()
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-emerald-500/30 pb-12">
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
                        <h1 className="text-lg font-bold tracking-tight text-white hidden sm:block">Gestión de Enlaces</h1>
                    </div>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all border border-emerald-500/50"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Enlace
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 tracking-tight text-white">Directorio Público</h2>
                        <p className="text-neutral-400 font-medium">Administra las plataformas accesibles (Total: {links.length})</p>
                    </div>
                </div>

                {/* Formulario */}
                {showForm && (
                    <Card className="bg-neutral-900/50 backdrop-blur-sm border-emerald-500/20 shadow-2xl shadow-emerald-500/10 mb-10 overflow-hidden relative animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                        <CardHeader className="border-b border-white/5 bg-white/[0.02] pb-6">
                            <CardTitle className="text-xl font-bold text-white">Configurar Nuevo Enlace</CardTitle>
                            <p className="text-sm text-neutral-400 mt-1">Completa los datos para publicarlo en la página principal.</p>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-neutral-300">Título Visual <span className="text-rose-500">*</span></Label>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Ej: Portal del Empleado"
                                            required
                                            className="bg-neutral-950 border-white/10 focus-visible:ring-emerald-500 text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-neutral-300">URL del Destino <span className="text-rose-500">*</span></Label>
                                        <Input
                                            type="url"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://acceso.organizacion.com"
                                            required
                                            className="bg-neutral-950 border-white/10 focus-visible:ring-emerald-500 text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-neutral-300">Resumen y Funcionalidad</Label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Descripción breve que detalle el uso de esta plataforma..."
                                        rows={3}
                                        className="bg-neutral-950 border-white/10 focus-visible:ring-emerald-500 text-white resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-neutral-300">Imagen Destacada <span className="text-neutral-500 font-normal">(Opcional)</span></Label>
                                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                                        <div className="w-full sm:w-2/3">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="bg-neutral-950 border-white/10 text-neutral-400 file:bg-white/5 file:text-neutral-200 file:border-0 file:rounded-md file:px-3 file:py-1 cursor-pointer"
                                            />
                                            <p className="text-xs text-neutral-500 mt-2">Formatos permitidos: JPG, PNG, WEBP. Relación ideal 16:9.</p>
                                        </div>

                                        {previewUrl && (
                                            <div className="w-full sm:w-1/3 relative h-32 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                                <Image
                                                    src={previewUrl}
                                                    alt="Vista previa"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6 mt-6 border-t border-white/5">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setShowForm(false)
                                            setTitle('')
                                            setDescription('')
                                            setUrl('')
                                            setImageFile(null)
                                            setPreviewUrl(null)
                                        }}
                                        className="flex-1 text-neutral-400 hover:text-white hover:bg-white/5 h-12"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white h-12 text-base font-semibold shadow-lg shadow-emerald-500/20 transition-all"
                                    >
                                        {isSubmitting ? "Procesando subida..." : "Publicar Enlace"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Lista de enlaces */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4" />
                        <p className="text-neutral-400">Cargando directorio...</p>
                    </div>
                ) : links.length === 0 ? (
                    <Card className="bg-neutral-900/50 backdrop-blur-sm border-white/5 shadow-xl text-center py-24 px-6 border-dashed">
                        <div className="w-16 h-16 bg-white/5 flex items-center justify-center rounded-2xl mx-auto mb-4 border border-white/10 rotate-3">
                            <LinkIcon size={24} className="text-neutral-500 -rotate-3" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Directorio Vacío</h3>
                        <p className="text-neutral-400 max-w-sm mx-auto">
                            Aún no has configurado enlaces operativos. Haz clic en "Añadir Enlace" para iniciar.
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
                        {links.map((link) => (
                            <Card key={link.id} className="group bg-neutral-900/50 backdrop-blur-sm border-white/5 overflow-hidden hover:border-emerald-500/30 transition-all duration-300 shadow-xl flex flex-col h-full">
                                {link.image_url ? (
                                    <div className="relative h-48 w-full border-b border-white/5 overflow-hidden bg-black/50">
                                        <Image
                                            src={link.image_url}
                                            alt={link.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                                        />
                                    </div>
                                ) : (
                                    <div className="relative h-48 w-full border-b border-white/5 bg-neutral-800 flex items-center justify-center">
                                        <LinkIcon size={48} className="text-neutral-700" />
                                    </div>
                                )}
                                <CardContent className="p-6 flex flex-col flex-1">
                                    <h3 className="font-bold text-lg mb-2 text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                                        {link.title}
                                    </h3>

                                    {link.description && (
                                        <p className="text-neutral-400 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                                            {link.description}
                                        </p>
                                    )}

                                    <div className="flex justify-between items-center pt-4 mt-auto border-t border-white/5">
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                                        >
                                            <ExternalLink size={14} className="mr-1.5" />
                                            <span>Visitar URL</span>
                                        </a>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteLink(link.id)}
                                            className="h-8 w-8 p-0 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}