"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, UserCheck, Briefcase, Building, Calendar, AlertTriangle, TrendingUp, Activity, FileText, MapPin, UserX, Clock, Heart, Umbrella, Download, FileSpreadsheet } from "lucide-react"
import { redirect } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useDashboard } from '@/hooks/useDashboard'
import { useReportes } from '@/hooks/useReportes'
import { useEffect } from 'react'
import InstallPWAButton from "@/components/InstallPWAButton"

export default function DashboardPage() {
  const token = useAuthStore(state => state.token)
  const user = useAuthStore(state => state.user)
  const { stats, activities, loading, error } = useDashboard()
  const { reportes, loading: loadingReporte, error: errorReporte } = useReportes()

  console.log('User in DashboardPage:', user)
  // Redirigir según rol
  if (user?.rol?.nombre_rol === 'SuperAdministrador') redirect('/dashboard/usuarios')
  if (user?.rol?.nombre_rol === 'Usuario') redirect('/dashboard/sobre-institucion')

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, {user?.funcionario?.primer_nombre || 'Usuario'}
          </p>
        </div>

        {/* Loading skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32 mb-2" />
                <Skeleton className="h-5 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Mostrar error si hay algún problema
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, {user?.funcionario?.primer_nombre || 'Usuario'}
          </p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <p>Error al cargar los datos del dashboard: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Datos por defecto si no hay stats
  const defaultStats = {
    totalFuncionarios: 0,
    funcionariosActivos: 0,
    funcionariosSuspendidos: 0,
    funcionariosBajaMedica: 0,
    funcionariosVacaciones: 0,
    totalUnidades: 0,
    ausenciasPendientes: 0,
    sancionesActivas: 0,
    documentosPendientes: 0,
    comisionesActivas: 0
  }

  const currentStats = stats || defaultStats

  const getStatsCards = () => {
    return [
      {
        title: "Total Funcionarios",
        value: currentStats.totalFuncionarios.toString(),
        description: "Funcionarios registrados",
        icon: Users,
        trend: "+0%",
        color: "text-blue-600",
        href: "/dashboard/funcionarios",
      },
      {
        title: "Funcionarios Activos",
        value: currentStats.funcionariosActivos.toString(),
        description: "En servicio activo",
        icon: UserCheck,
        trend: `${currentStats.funcionariosActivos > 0 ? '+' : ''}${((currentStats.funcionariosActivos / Math.max(currentStats.totalFuncionarios, 1)) * 100).toFixed(1)}%`,
        color: "text-green-600",
        href: "/dashboard/funcionarios",
      },
      {
        title: "Funcionarios Suspendidos",
        value: currentStats.funcionariosSuspendidos.toString(),
        description: "Temporalmente suspendidos",
        icon: UserX,
        trend: currentStats.funcionariosSuspendidos > 0 ? "Atención" : "Normal",
        color: "text-red-600",
        href: "/dashboard/sanciones",
      },
      {
        title: "En Baja Médica",
        value: currentStats.funcionariosBajaMedica.toString(),
        description: "Por motivos de salud",
        icon: Heart,
        trend: currentStats.funcionariosBajaMedica > 0 ? "Activo" : "Normal",
        color: "text-orange-600",
        href: "/dashboard/ausencias",
      },
      {
        title: "De Vacaciones",
        value: currentStats.funcionariosVacaciones.toString(),
        description: "En período vacacional",
        icon: Umbrella,
        trend: currentStats.funcionariosVacaciones > 0 ? "Activo" : "Normal",
        color: "text-purple-600",
        href: "/dashboard/ausencias",
      },
      {
        title: "Unidades Activas",
        value: currentStats.totalUnidades.toString(),
        description: "Departamentos operativos",
        icon: Building,
        trend: "+0%",
        color: "text-indigo-600",
        href: "/dashboard/unidades",
      },
      {
        title: "Ausencias Pendientes",
        value: currentStats.ausenciasPendientes.toString(),
        description: "Solicitudes por aprobar",
        icon: Clock,
        trend: currentStats.ausenciasPendientes > 0 ? "Pendiente" : "Al día",
        color: "text-yellow-600",
        href: "/dashboard/ausencias",
      },
      {
        title: "Sanciones Activas",
        value: currentStats.sancionesActivas.toString(),
        description: "Medidas disciplinarias",
        icon: AlertTriangle,
        trend: currentStats.sancionesActivas > 0 ? "Atención" : "Normal",
        color: "text-red-600",
        href: "/dashboard/sanciones",
      },
    ]
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'funcionario':
        return <Users className="h-3 w-3" />
      case 'ausencia':
        return <Calendar className="h-3 w-3" />
      case 'sancion':
        return <AlertTriangle className="h-3 w-3" />
      case 'documento':
        return <FileText className="h-3 w-3" />
      case 'comision':
        return <MapPin className="h-3 w-3" />
      default:
        return <Activity className="h-3 w-3" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'funcionario':
        return 'text-blue-600'
      case 'ausencia':
        return 'text-yellow-600'
      case 'sancion':
        return 'text-red-600'
      case 'documento':
        return 'text-green-600'
      case 'comision':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Panel de Control</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user?.funcionario?.primer_nombre || 'Usuario'}
        </p>

      </div>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {getStatsCards().map((stat) => {
          const IconComponent = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {stat.trend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Charts and Activities Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Resumen de Actividades */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Resumen de Actividades
            </CardTitle>
            <CardDescription>
              Estadísticas generales del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/documentos" className="space-y-2 p-3 rounded-lg hover:bg-accent transition-colors">
                <p className="text-sm font-medium text-muted-foreground">Documentos</p>
                <p className="text-2xl font-bold">{currentStats.documentosPendientes}</p>
                <p className="text-xs text-muted-foreground">Pendientes aprobación</p>
              </Link>
              <Link href="/dashboard/comisiones" className="space-y-2 p-3 rounded-lg hover:bg-accent transition-colors">
                <p className="text-sm font-medium text-muted-foreground">Comisiones</p>
                <p className="text-2xl font-bold">{currentStats.comisionesActivas}</p>
                <p className="text-xs text-muted-foreground">En curso</p>
              </Link>
              <Link href="/dashboard/ausencias/pendientes" className="space-y-2 p-3 rounded-lg hover:bg-accent transition-colors">
                <p className="text-sm font-medium text-muted-foreground">Ausencias</p>
                <p className="text-2xl font-bold">{currentStats.ausenciasPendientes}</p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </Link>
              <Link href="/dashboard/funcionarios/activos" className="space-y-2 p-3 rounded-lg hover:bg-accent transition-colors">
                <p className="text-sm font-medium text-muted-foreground">Eficiencia</p>
                <p className="text-2xl font-bold">
                  {Math.round((currentStats.funcionariosActivos / Math.max(currentStats.totalFuncionarios, 1)) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Funcionarios activos</p>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Actividades Recientes
            </CardTitle>
            <CardDescription>
              Últimas acciones en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accesos directos a funcionalidades principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/funcionarios"
              className="flex flex-col items-center p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium">Funcionarios</span>
              <span className="text-xs text-muted-foreground">{currentStats.totalFuncionarios} registrados</span>
            </Link>
            <Link
              href="/dashboard/ausencias"
              className="flex flex-col items-center p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <Calendar className="h-8 w-8 text-yellow-600 mb-2" />
              <span className="text-sm font-medium">Ausencias</span>
              <span className="text-xs text-muted-foreground">{currentStats.ausenciasPendientes} pendientes</span>
            </Link>
            <Link
              href="/dashboard/sanciones"
              className="flex flex-col items-center p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
              <span className="text-sm font-medium">Sanciones</span>
              <span className="text-xs text-muted-foreground">{currentStats.sancionesActivas} activas</span>
            </Link>
            <Link
              href="/dashboard/documentos"
              className="flex flex-col items-center p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <FileText className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium">Documentos</span>
              <span className="text-xs text-muted-foreground">{currentStats.documentosPendientes} por aprobar</span>
            </Link>
          </div>
        </CardContent>
      </Card>


    </div>
  )
}