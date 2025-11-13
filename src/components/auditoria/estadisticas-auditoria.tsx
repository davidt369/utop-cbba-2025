"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart
} from "recharts"
import {
    TrendingUp,
    Activity,
    Users,
    Calendar,
    UserPlus,
    Edit3,
    Trash2,
    RotateCcw,
    BarChart3,
    PieChart as PieChartIcon,
    Clock
} from "lucide-react"
import api from "@/lib/axios"

interface EstadisticasData {
    total_eventos: number
    eventos_por_tipo: Record<string, number>
    eventos_por_mes: Array<{
        mes: number
        año: number
        total: number
    }>
    funcionarios_con_cambios: number
}

const COLORS = {
    created: '#10b981',
    updated: '#3b82f6',
    deleted: '#ef4444',
    restored: '#8b5cf6'
}

const eventLabels = {
    created: "Creaciones",
    updated: "Actualizaciones",
    deleted: "Eliminaciones",
    restored: "Restauraciones"
}

const eventIcons = {
    created: UserPlus,
    updated: Edit3,
    deleted: Trash2,
    restored: RotateCcw
}

const mesesNombres = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
]

export function EstadisticasAuditoria() {
    const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        cargarEstadisticas()
    }, [])

    const cargarEstadisticas = async () => {
        setLoading(true)
        try {
            const response = await api.get('/auth/historial-auditoria/estadisticas')
            const data = response.data

            console.log('📊 Estadísticas recibidas:', data)

            if (data.success) {
                setEstadisticas(data.estadisticas)
            } else {
                console.error('API response error:', data)
                // Fallback con datos vacíos si falla la API
                setEstadisticas({
                    total_eventos: 0,
                    eventos_por_tipo: {},
                    eventos_por_mes: [],
                    funcionarios_con_cambios: 0
                })
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error)
            // Fallback con datos vacíos si falla la API
            setEstadisticas({
                total_eventos: 0,
                eventos_por_tipo: {},
                eventos_por_mes: [],
                funcionarios_con_cambios: 0
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!estadisticas) {
        return (
            <Card className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No hay datos disponibles</h3>
                <p className="text-muted-foreground">No se pudieron cargar las estadísticas de auditoría.</p>
            </Card>
        )
    }

    // Preparar datos para gráficos
    const datosPorTipo = Object.entries(estadisticas.eventos_por_tipo).map(([tipo, cantidad]) => ({
        tipo,
        cantidad,
        label: eventLabels[tipo as keyof typeof eventLabels] || tipo,
        color: COLORS[tipo as keyof typeof COLORS] || '#6b7280'
    }))

    const datosPorMes = estadisticas.eventos_por_mes.map(item => ({
        mes: `${mesesNombres[item.mes - 1]} ${item.año}`,
        total: item.total,
        mesNumero: item.mes,
        año: item.año
    })).reverse()

    const totalEventosPorcentaje = datosPorTipo.reduce((acc, item) => {
        acc[item.tipo] = estadisticas.total_eventos > 0
            ? Math.round((item.cantidad / estadisticas.total_eventos) * 100)
            : 0
        return acc
    }, {} as Record<string, number>)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Estadísticas de Auditoría</h1>
                    <p className="text-sm text-muted-foreground">
                        Análisis completo del historial de cambios en cargos
                    </p>
                </div>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{estadisticas.total_eventos.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                Todos los cambios registrados
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Funcionarios Afectados</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{estadisticas.funcionarios_con_cambios}</div>
                            <p className="text-xs text-muted-foreground">
                                Con cambios registrados
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Promedio por Funcionario</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {estadisticas.funcionarios_con_cambios > 0
                                    ? Math.round(estadisticas.total_eventos / estadisticas.funcionarios_con_cambios * 10) / 10
                                    : 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Eventos por funcionario
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Período de Actividad</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{estadisticas.eventos_por_mes.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Meses con actividad
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de barras - Eventos por tipo */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Eventos por Tipo
                            </CardTitle>
                            <CardDescription>Distribución de los tipos de cambios registrados</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={datosPorTipo}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="label"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar
                                        dataKey="cantidad"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Gráfico circular - Distribución de eventos */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChartIcon className="w-5 h-5" />
                                Distribución de Eventos
                            </CardTitle>
                            <CardDescription>Porcentaje de cada tipo de evento</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={datosPorTipo}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="cantidad"
                                        label={({ label, percent }) => `${label} ${(Number(percent) * 100).toFixed(0)}%`}
                                    >
                                        {datosPorTipo.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Gráfico de línea - Tendencia temporal */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Tendencia Temporal
                        </CardTitle>
                        <CardDescription>Evolución de los eventos de auditoría por mes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={datosPorMes}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="mes"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.1}
                                />
                                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Detalles por tipo de evento */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Desglose Detallado</CardTitle>
                        <CardDescription>Análisis detallado de cada tipo de evento</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {datosPorTipo.map((item, index) => {
                                const Icon = eventIcons[item.tipo as keyof typeof eventIcons] || Activity
                                const porcentaje = totalEventosPorcentaje[item.tipo]

                                return (
                                    <div key={item.tipo} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${item.color}20` }}>
                                                <Icon className="w-4 h-4" style={{ color: item.color }} />
                                            </div>
                                            <div>
                                                <div className="font-medium">{item.label}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {item.cantidad} eventos ({porcentaje}%)
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold" style={{ color: item.color }}>
                                                {item.cantidad}
                                            </div>
                                            <Progress value={porcentaje} className="w-24 mt-1" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}