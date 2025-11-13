"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    History,
    Search,
    Filter,
    CalendarIcon,
    User,
    Activity,
    Clock,
    ChevronDown,
    ChevronUp,
    UserPlus,
    Edit3,
    Trash2,
    RotateCcw,
    FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import api from "@/lib/axios"

interface HistorialEvento {
    id: number
    evento: string
    descripcion: string
    descripcion_detallada?: string
    cambios?: {
        anterior: Record<string, any> | null
        nuevo: Record<string, any> | null
    } | null
    usuario: string
    fecha: string
    fecha_raw: string
    funcionario?: {
        nombres: string
        apellidos: string
        ci: string
    }
    cargo?: {
        nombre: string
    }
}

interface HistorialAuditoriaProps {
    funcionarioId?: number
    mostrarFiltros?: boolean
    limite?: number
}

const eventIcons = {
    created: { icon: UserPlus, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    updated: { icon: Edit3, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    deleted: { icon: Trash2, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
    restored: { icon: RotateCcw, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
}

const eventLabels = {
    created: "Creación",
    updated: "Actualización",
    deleted: "Eliminación",
    restored: "Restauración"
}

export function HistorialAuditoria({ funcionarioId, mostrarFiltros = true, limite = 20 }: HistorialAuditoriaProps) {
    const [eventos, setEventos] = useState<HistorialEvento[]>([])
    const [loading, setLoading] = useState(true)
    const [filtros, setFiltros] = useState({
        busqueda: "",
        evento: "all",
        fechaInicio: undefined as Date | undefined,
        fechaFin: undefined as Date | undefined,
        modelo: 'all'
    })
    const [eventoExpandido, setEventoExpandido] = useState<number | null>(null)
    const [paginacion, setPaginacion] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    })

    useEffect(() => {
        cargarHistorial()
    }, [funcionarioId, filtros])

    const cargarHistorial = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()

            if (filtros.busqueda) params.append('search', filtros.busqueda)
            if (filtros.evento !== 'all') params.append('evento', filtros.evento)
            if (filtros.fechaInicio) params.append('fecha_inicio', format(filtros.fechaInicio, 'yyyy-MM-dd'))
            if (filtros.fechaFin) params.append('fecha_fin', format(filtros.fechaFin, 'yyyy-MM-dd'))

            if (filtros.modelo && filtros.modelo !== 'all') {
                params.append('model', filtros.modelo)
            } else if (!funcionarioId) {
                params.append('model', 'all')
            }

            const endpoint = funcionarioId
                ? `/auth/historial-auditoria/funcionario/${funcionarioId}?${params}`
                : `/auth/historial-auditoria?${params}`

            const response = await api.get(endpoint)
            const data = response.data

            if (data.success) {
                const eventosData = data.historial || data.data || []
                setEventos(eventosData)
                if (data.pagination) {
                    setPaginacion(data.pagination)
                }
            } else {
                setEventos([])
            }
        } catch (error) {
            setEventos([])
        } finally {
            setLoading(false)
        }
    }

    const toggleEventoExpandido = (eventoId: number) => {
        setEventoExpandido(eventoExpandido === eventoId ? null : eventoId)
    }

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: "",
            evento: "all",
            fechaInicio: undefined,
            fechaFin: undefined,
            modelo: 'all'
        })
    }

    return (
        <div className="space-y-6 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <History className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {funcionarioId ? "Historial de Funcionario" : "Historial de Auditoría"}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Registro completo de cambios en asignaciones de cargos
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 sm:mt-0">
                    <Activity className="w-4 h-4" />
                    <span>{eventos.length} eventos</span>
                </div>
            </div>

            {/* Filtros */}
            {mostrarFiltros && (
                <Card className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Búsqueda */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Buscar</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar funcionario o descripción..."
                                    value={filtros.busqueda}
                                    onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                                    className="pl-9 h-10"
                                />
                            </div>
                        </div>

                        {/* Tipo de evento */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo de Evento</label>
                            <Select value={filtros.evento} onValueChange={(value) => setFiltros(prev => ({ ...prev, evento: value }))}>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Todos los eventos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los eventos</SelectItem>
                                    <SelectItem value="created">Creaciones</SelectItem>
                                    <SelectItem value="updated">Actualizaciones</SelectItem>
                                    <SelectItem value="deleted">Eliminaciones</SelectItem>
                                    <SelectItem value="restored">Restauraciones</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Modelo (tabla) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Modelo / Tabla</label>
                            <Select value={filtros.modelo} onValueChange={(value) => setFiltros(prev => ({ ...prev, modelo: value }))}>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Todos los modelos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos (all)</SelectItem>
                                    <SelectItem value="FuncionarioCargo">FuncionarioCargo</SelectItem>
                                    <SelectItem value="Funcionario">Funcionario</SelectItem>
                                    <SelectItem value="Cargo">Cargo</SelectItem>
                                    <SelectItem value="Unidad">Unidad</SelectItem>
                                    <SelectItem value="Ausencia">Ausencia</SelectItem>
                                    <SelectItem value="CambioDestino">CambioDestino</SelectItem>
                                    <SelectItem value="Comision">Comision</SelectItem>
                                    <SelectItem value="Documento">Documento</SelectItem>
                                    <SelectItem value="FaltaDisciplinaria">FaltaDisciplinaria</SelectItem>
                                    <SelectItem value="Sancion">Sancion</SelectItem>
                                    <SelectItem value="Rol">Rol</SelectItem>
                                    <SelectItem value="Usuario">Usuario</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fecha inicio */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fecha Inicio</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filtros.fechaInicio ? format(filtros.fechaInicio, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={filtros.fechaInicio}
                                        onSelect={(date) => setFiltros(prev => ({ ...prev, fechaInicio: date }))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Fecha fin */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fecha Fin</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filtros.fechaFin ? format(filtros.fechaFin, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={filtros.fechaFin}
                                        onSelect={(date) => setFiltros(prev => ({ ...prev, fechaFin: date }))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={limpiarFiltros} size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Limpiar Filtros
                        </Button>
                    </div>
                </Card>
            )}

            {/* Lista de eventos */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : eventos.length === 0 ? (
                    <Card className="p-8 text-center">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No hay eventos registrados</h3>
                        <p className="text-muted-foreground">
                            No se encontraron eventos que coincidan con los filtros aplicados.
                        </p>
                    </Card>
                ) : (
                    <AnimatePresence>
                        {eventos.map((evento, index) => {
                            const eventConfig = eventIcons[evento.evento as keyof typeof eventIcons] || eventIcons.updated
                            const Icon = eventConfig.icon
                            const isExpanded = eventoExpandido === evento.id

                            return (
                                <motion.div
                                    key={evento.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <Card className={cn("transition-all hover:shadow-lg", eventConfig.border, "border-l-4")}>
                                        <CardHeader
                                            className="cursor-pointer p-4 sm:p-5"
                                            onClick={() => toggleEventoExpandido(evento.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className={cn("p-2 rounded-lg", eventConfig.bg)}>
                                                        <Icon className={cn("w-4 h-4", eventConfig.color)} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <CardTitle className="text-base leading-tight font-semibold truncate">
                                                            {evento.descripcion}
                                                        </CardTitle>
                                                        {/* Mostrar nombre del modelo/tabla si está disponible */}
                                                        {(() => {
                                                            const modelName = (evento as any).subject_type || (evento as any).model || (evento as any).tabla || null
                                                            if (modelName) {
                                                                const parts = String(modelName).split('\\')
                                                                const shortName = parts[parts.length - 1]
                                                                return (
                                                                    <div className="text-xs text-muted-foreground mt-1 truncate">
                                                                        Modelo: {shortName}
                                                                    </div>
                                                                )
                                                            }
                                                            return null
                                                        })()}

                                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {(() => {
                                                                    try {
                                                                        const fecha = new Date(evento.fecha_raw || evento.fecha)
                                                                        return isNaN(fecha.getTime())
                                                                            ? evento.fecha || 'Fecha no disponible'
                                                                            : format(fecha, "dd/MM/yyyy HH:mm", { locale: es })
                                                                    } catch (error) {
                                                                        return evento.fecha || 'Fecha no disponible'
                                                                    }
                                                                })()}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <User className="w-3 h-3" />
                                                                {evento.usuario}
                                                            </div>
                                                            <Badge variant="secondary" className="text-xs px-2 py-1">
                                                                {eventLabels[evento.evento as keyof typeof eventLabels]}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="shrink-0">
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </CardHeader>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Separator />
                                                    <CardContent className="pt-4 pb-4 sm:pt-5 sm:pb-5">
                                                        <div className="space-y-4">
                                                            {/* Información del funcionario afectado */}
                                                            {evento.funcionario && (evento.funcionario.nombres || evento.funcionario.apellidos || evento.funcionario.ci) && (
                                                                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                                    <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                                                        <User className="w-4 h-4" />
                                                                        Funcionario Afectado
                                                                    </h4>
                                                                    <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                                                        {(evento.funcionario.nombres || evento.funcionario.apellidos) && (
                                                                            <p><strong>Nombre:</strong> {evento.funcionario.nombres} {evento.funcionario.apellidos}</p>
                                                                        )}
                                                                        {evento.funcionario.ci && (
                                                                            <p><strong>CI:</strong> {evento.funcionario.ci}</p>
                                                                        )}
                                                                        {evento.cargo && evento.cargo.nombre && (
                                                                            <p><strong>Cargo:</strong> {evento.cargo.nombre}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Información del administrador que realizó el cambio */}
                                                            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                                                <h4 className="font-medium text-sm text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                                                                    <User className="w-4 h-4" />
                                                                    Responsable del Cambio
                                                                </h4>
                                                                <div className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                                                                    <p><strong>Usuario:</strong> {evento.usuario}</p>
                                                                    <p><strong>Fecha/Hora:</strong> {(() => {
                                                                        try {
                                                                            const fecha = new Date(evento.fecha_raw || evento.fecha)
                                                                            return isNaN(fecha.getTime())
                                                                                ? evento.fecha || 'Fecha no disponible'
                                                                                : format(fecha, "dd/MM/yyyy 'a las' HH:mm:ss", { locale: es })
                                                                        } catch (error) {
                                                                            return evento.fecha || 'Fecha no disponible'
                                                                        }
                                                                    })()}</p>
                                                                    <p><strong>Tipo de acción:</strong> {eventLabels[evento.evento as keyof typeof eventLabels]}</p>
                                                                </div>
                                                            </div>

                                                            {/* Descripción Detallada */}
                                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                <h4 className="font-medium text-sm mb-2">Descripción Detallada</h4>
                                                                <p className="text-sm text-foreground">{evento.descripcion_detallada || evento.descripcion}</p>
                                                            </div>

                                                            {/* Cambios detallados */}
                                                            {evento.evento === 'created' && evento.cambios && evento.cambios.nuevo ? (
                                                                <div className="space-y-3">
                                                                    <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                                                                        <Edit3 className="w-4 h-4" />
                                                                        Datos Creación
                                                                    </h4>
                                                                    <div className="grid gap-3">
                                                                        {Object.entries(evento.cambios.nuevo).map(([campo, valor]) => {
                                                                            const campoFormateado = campo
                                                                                .replace('_id', '')
                                                                                .replace('_', ' ')
                                                                                .split(' ')
                                                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                                                .join(' ')

                                                                            return (
                                                                                <div key={campo} className="p-3 sm:p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-border/50">
                                                                                    <div className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                                                                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                                                        {campoFormateado}
                                                                                    </div>
                                                                                    <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
                                                                                        <div className="text-sm font-semibold text-green-800 dark:text-green-200 break-all">{String(valor)}</div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            ) : evento.evento === 'deleted' && evento.cambios && evento.cambios.anterior ? (
                                                                <div className="space-y-3">
                                                                    <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                                                                        <Trash2 className="w-4 h-4" />
                                                                        Datos Eliminación
                                                                    </h4>
                                                                    <div className="grid gap-3">
                                                                        {Object.entries(evento.cambios.anterior).map(([campo, valor]) => {
                                                                            const campoFormateado = campo
                                                                                .replace('_id', '')
                                                                                .replace('_', ' ')
                                                                                .split(' ')
                                                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                                                .join(' ')

                                                                            return (
                                                                                <div key={campo} className="p-3 sm:p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-border/50">
                                                                                    <div className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                                                                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                                                        {campoFormateado}
                                                                                    </div>
                                                                                    <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
                                                                                        <div className="text-sm font-semibold text-red-800 dark:text-red-200 break-all">{String(valor)}</div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            ) : evento.cambios && evento.cambios.anterior && evento.cambios.nuevo ? (
                                                                <div className="space-y-3">
                                                                    <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                                                                        <Edit3 className="w-4 h-4" />
                                                                        Cambios Realizados
                                                                    </h4>
                                                                    <div className="grid gap-3">
                                                                        {Object.entries(evento.cambios?.nuevo || {}).map(([campo, valorNuevo]) => {
                                                                            const valorAnterior = evento.cambios?.anterior?.[campo]

                                                                            const campoFormateado = campo
                                                                                .replace('_id', '')
                                                                                .replace('_', ' ')
                                                                                .split(' ')
                                                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                                                .join(' ')

                                                                            return (
                                                                                <div key={campo} className="p-3 sm:p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-border/50">
                                                                                    <div className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                                                                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                                                        {campoFormateado}
                                                                                    </div>
                                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-center">
                                                                                        <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
                                                                                            <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">ANTERIOR</div>
                                                                                            <div className="text-sm font-semibold text-red-800 dark:text-red-200 break-all">
                                                                                                {valorAnterior || 'Sin valor'}
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="flex justify-center">
                                                                                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                                                                <div className="w-4 h-0.5 bg-primary"></div>
                                                                                                <div className="w-0 h-0 border-l-4 border-l-primary border-y-2 border-y-transparent ml-1"></div>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
                                                                                            <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">NUEVO</div>
                                                                                            <div className="text-sm font-semibold text-green-800 dark:text-green-200 break-all">
                                                                                                {valorNuevo}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed border-border">
                                                                    <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                                                    <p className="text-muted-foreground text-sm">No hay información detallada de cambios disponible</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Paginación */}
            {paginacion.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                        Página {paginacion.currentPage} de {paginacion.totalPages} ({paginacion.total} eventos total)
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={paginacion.currentPage === 1}
                            onClick={() => {/* implementar navegación */ }}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={paginacion.currentPage === paginacion.totalPages}
                            onClick={() => {/* implementar navegación */ }}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}