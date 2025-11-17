"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, FileText, FileSpreadsheet, Users, Calendar, AlertTriangle, TrendingUp, MapPin, ClipboardList } from "lucide-react"
import { useReportes } from '@/hooks/useReportes'

const reportesConfig = [
    {
        key: 'dashboard',
        title: 'Dashboard General',
        icon: TrendingUp,
        color: 'blue',
        filters: [{ key: 'general', label: 'Estadísticas Generales' }]
    },
    {
        key: 'funcionarios',
        title: 'Funcionarios',
        icon: Users,
        color: 'green',
        filters: [
            { key: 'todos', label: 'Todos los Funcionarios' },
            { key: 'activos', label: 'Solo Activos' },
            { key: 'baja-medica', label: 'En Baja Médica' },
            { key: 'vacaciones', label: 'De Vacaciones' },
            { key: 'suspendidos', label: 'Suspendidos' }
        ]
    },
    {
        key: 'ausencias',
        title: 'Ausencias',
        icon: Calendar,
        color: 'yellow',
        filters: [
            { key: 'pendientes', label: 'Pendientes' },
            { key: 'aprobadas', label: 'Aprobadas' },
            { key: 'rechazadas', label: 'Rechazadas' },
            { key: 'todas', label: 'Todas las Ausencias' }
        ]
    },
    {
        key: 'sanciones',
        title: 'Sanciones',
        icon: AlertTriangle,
        color: 'red',
        filters: [
            { key: 'activas', label: 'Activas' },
            { key: 'cumplidas', label: 'Cumplidas' },
            { key: 'todas', label: 'Todas las Sanciones' }
        ]
    },
    {
        key: 'faltasDisciplinarias',
        title: 'Faltas Disciplinarias',
        icon: ClipboardList,
        color: 'orange',
        filters: [
            { key: 'activas', label: 'Activas' },
            { key: 'todas', label: 'Todas las Faltas' }
        ]
    },
    {
        key: 'comisiones',
        title: 'Comisiones',
        icon: MapPin,
        color: 'purple',
        filters: [
            { key: 'activas', label: 'Activas' },
            { key: 'todas', label: 'Todas las Comisiones' }
        ]
    }
]

const colorClasses = {
    blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        button: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
    },
    green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        button: 'hover:bg-green-100 dark:hover:bg-green-900/30'
    },
    yellow: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-600 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800',
        button: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
    },
    red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        button: 'hover:bg-red-100 dark:hover:bg-red-900/30'
    },
    orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        button: 'hover:bg-orange-100 dark:hover:bg-orange-900/30'
    },
    purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        button: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
    }
}

export default function ReportesPage() {
    const { reportes, loading: loadingReporte, error: errorReporte } = useReportes()

    const handleDownload = (type: keyof typeof reportes, format: 'pdf' | 'excel', filter?: string) => {
        if (reportes[type]?.[format]) {
            reportes[type][format](filter)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Download className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                    Reportes del Sistema
                                </h1>
                            </div>
                            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
                                Descarga reportes en PDF y Excel de los datos del sistema
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:text-right">
                            <p className="text-sm text-muted-foreground">
                                Última actualización: {new Date().toLocaleDateString('es-ES')}
                            </p>
                            <div className="flex gap-2 sm:justify-end">
                                <Badge variant="secondary" className="px-2 py-1">
                                    {reportesConfig.length} tipos de reportes
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reportes Grid */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                    <Download className="h-5 w-5 text-primary" />
                                    Reportes Disponibles
                                </CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Selecciona el tipo de reporte y formato de descarga
                                </CardDescription>
                            </div>
                            {loadingReporte && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                                    Cargando...
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        {errorReporte && (
                            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                <p className="text-sm text-destructive flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    Error al descargar reporte: {errorReporte}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {reportesConfig.map((reporte) => {
                                const colors = colorClasses[reporte.color as keyof typeof colorClasses]
                                const Icon = reporte.icon

                                return (
                                    <div
                                        key={reporte.key}
                                        className={`p-4 border-2 rounded-xl transition-all duration-200 hover:shadow-md ${colors.bg} ${colors.border}`}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`p-2 rounded-lg ${colors.bg}`}>
                                                <Icon className={`h-5 w-5 ${colors.text}`} />
                                            </div>
                                            <h4 className="font-semibold text-base leading-tight">
                                                {reporte.title}
                                            </h4>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Formatos principales */}
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDownload(reporte.key as keyof typeof reportes, 'pdf', reporte.filters[0].key)}
                                                    disabled={loadingReporte}
                                                    className={`flex-1 text-xs h-9 ${colors.button}`}
                                                >
                                                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                                                    PDF
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDownload(reporte.key as keyof typeof reportes, 'excel', reporte.filters[0].key)}
                                                    disabled={loadingReporte}
                                                    className={`flex-1 text-xs h-9 ${colors.button}`}
                                                >
                                                    <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                                                    Excel
                                                </Button>
                                            </div>

                                            {/* Filtros adicionales */}
                                            {reporte.filters.length > 1 && (
                                                <div className="space-y-2">
                                                    <p className="text-xs text-muted-foreground font-medium">
                                                        Filtros específicos:
                                                    </p>
                                                    <div className="space-y-1.5">
                                                        {reporte.filters.slice(1).map((filter) => (
                                                            <div key={filter.key} className="flex gap-1.5">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDownload(reporte.key as keyof typeof reportes, 'pdf', filter.key)}
                                                                    disabled={loadingReporte}
                                                                    className="flex-1 h-8 text-xs px-2"
                                                                >
                                                                    PDF
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDownload(reporte.key as keyof typeof reportes, 'excel', filter.key)}
                                                                    disabled={loadingReporte}
                                                                    className="flex-1 h-8 text-xs px-2"
                                                                >
                                                                    Excel
                                                                </Button>
                                                                <span className="flex-1 text-xs text-muted-foreground flex items-center px-2 truncate">
                                                                    {filter.label}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Información adicional */}
                        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="p-4 bg-muted/30 rounded-xl border">
                                <h6 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    Formato PDF
                                </h6>
                                <ul className="text-xs text-muted-foreground space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">•</span>
                                        <span>Diseño profesional optimizado para impresión</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">•</span>
                                        <span>Layout en formato paisaje para mejor visualización</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">•</span>
                                        <span>Encabezados institucionales incluidos</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">•</span>
                                        <span>Compatible con todos los lectores de PDF</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-xl border">
                                <h6 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                    Formato Excel
                                </h6>
                                <ul className="text-xs text-muted-foreground space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">•</span>
                                        <span>Datos estructurados para análisis</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">•</span>
                                        <span>Compatible con Excel, Google Sheets y LibreOffice</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">•</span>
                                        <span>Fácil de filtrar y ordenar</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">•</span>
                                        <span>Ideal para procesamiento de datos</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}