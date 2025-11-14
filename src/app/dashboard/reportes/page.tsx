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
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600', border: 'border-green-200' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600', border: 'border-yellow-200' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600', border: 'border-red-200' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600', border: 'border-orange-200' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600', border: 'border-purple-200' }
}

export default function ReportesPage() {
    const { reportes, loading: loadingReporte, error: errorReporte } = useReportes()

    const handleDownload = (type: keyof typeof reportes, format: 'pdf' | 'excel', filter?: string) => {
        if (reportes[type]?.[format]) {
            reportes[type][format](filter)
        }
    }

    return (
        <div className="space-y-6 px-4 md:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Download className="h-8 w-8 text-primary" />
                        Reportes del Sistema
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Descarga reportes en PDF y Excel de los datos del sistema
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                        Última actualización: {new Date().toLocaleDateString('es-ES')}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                        {reportesConfig.length} tipos de reportes
                    </Badge>
                </div>
            </div>

            {/* Reportes Grid */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-primary" />
                        Reportes Disponibles
                        {loadingReporte && (
                            <div className="ml-auto animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                        )}
                    </CardTitle>
                    <CardDescription>
                        Selecciona el tipo de reporte y formato de descarga
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {errorReporte && (
                        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm text-destructive">
                                Error al descargar reporte: {errorReporte}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reportesConfig.map((reporte) => {
                            const colors = colorClasses[reporte.color as keyof typeof colorClasses]
                            const Icon = reporte.icon

                            return (
                                <div
                                    key={reporte.key}
                                    className={`p-4 border rounded-lg ${colors.bg} ${colors.border}`}
                                >
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Icon className={`h-4 w-4 ${colors.text}`} />
                                        {reporte.title}
                                    </h4>

                                    <div className="space-y-3">
                                        {/* Formatos principales */}
                                        <div className="flex gap-2">
                                            {/* Solo mostrar PDF para todos excepto Dashboard */}
                                            {reporte.key !== 'dashboard' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDownload(reporte.key as keyof typeof reportes, 'pdf', reporte.filters[0].key)}
                                                    disabled={loadingReporte}
                                                    className="flex-1"
                                                >
                                                    <FileText className="h-3 w-3 mr-1" />
                                                    PDF
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDownload(reporte.key as keyof typeof reportes, 'excel', reporte.filters[0].key)}
                                                disabled={loadingReporte}
                                                className={reporte.key === 'dashboard' ? 'w-full' : 'flex-1'}
                                            >
                                                <FileSpreadsheet className="h-3 w-3 mr-1" />
                                                Excel
                                            </Button>
                                        </div>

                                        {/* Filtros adicionales */}
                                        {reporte.filters.length > 1 && (
                                            <div className="space-y-1">
                                                {reporte.filters.slice(1).map((filter) => (
                                                    <div key={filter.key} className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDownload(reporte.key as keyof typeof reportes, 'pdf', filter.key)}
                                                            disabled={loadingReporte}
                                                            className="flex-1 h-7 text-xs"
                                                        >
                                                            PDF {filter.label}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDownload(reporte.key as keyof typeof reportes, 'excel', filter.key)}
                                                            disabled={loadingReporte}
                                                            className="flex-1 h-7 text-xs"
                                                        >
                                                            Excel {filter.label}
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Información adicional */}
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h6 className="font-medium text-sm mb-3 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Formato PDF
                            </h6>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Diseño profesional optimizado para impresión</li>
                                <li>• Layout en formato paisaje para mejor visualización</li>
                                <li>• Encabezados institucionales incluidos</li>
                                <li>• Compatible con todos los lectores de PDF</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h6 className="font-medium text-sm mb-3 flex items-center gap-2">
                                <FileSpreadsheet className="h-4 w-4" />
                                Formato Excel
                            </h6>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Datos estructurados para análisis</li>
                                <li>• Compatible con Excel, Google Sheets y LibreOffice</li>
                                <li>• Fácil de filtrar y ordenar</li>
                                <li>• Ideal para procesamiento de datos</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}