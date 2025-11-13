"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, User, FileText } from "lucide-react"
import Link from "next/link"
import { useDashboard, type AusenciaDetalle } from '@/hooks/useDashboard'

const estadoLabels: Record<string, string> = {
  'pendientes': 'Ausencias Pendientes',
  'aprobadas': 'Ausencias Aprobadas',
  'rechazadas': 'Ausencias Rechazadas'
}

const estadoBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  'pendiente': 'outline',
  'aprobada': 'default',
  'rechazada': 'destructive'
}

const tipoLabels: Record<string, string> = {
  'Vacaciones': 'Vacaciones',
  'Permiso': 'Permiso',
  'Baja Médica': 'Baja Médica',
  'Licencia': 'Licencia',
  'Comisión': 'Comisión'
}

export default function AusenciasEstadoPage() {
  const params = useParams()
  const estado = params.estado as string
  const { fetchAusenciasByEstado } = useDashboard()
  
  const [ausencias, setAusencias] = useState<AusenciaDetalle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    const loadAusencias = async () => {
      setLoading(true)
      setError(null)
      
      const result = await fetchAusenciasByEstado(estado)
      if (result) {
        setAusencias(result.data)
        setPagination(result.pagination)
      } else {
        setError('Error al cargar las ausencias')
      }
      setLoading(false)
    }

    if (estado) {
      loadAusencias()
    }
  }, [estado, fetchAusenciasByEstado])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES')
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('es-ES')
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {estadoLabels[estado] || 'Ausencias'}
            </h1>
          </div>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <Calendar className="h-5 w-5" />
              <p>Error al cargar las ausencias: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {estadoLabels[estado] || 'Ausencias'}
          </h1>
          <p className="text-muted-foreground">
            {pagination ? `${pagination.total} ausencias encontradas` : 'Listado de ausencias'}
          </p>
        </div>
      </div>

      {/* Ausencias Grid */}
      {ausencias.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay ausencias
              </h3>
              <p className="text-muted-foreground">
                No se encontraron ausencias con el estado "{estado}".
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ausencias.map((ausencia) => (
            <Card key={ausencia.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {tipoLabels[ausencia.tipo_ausencia] || ausencia.tipo_ausencia}
                    </CardTitle>
                    <CardDescription>
                      {ausencia.funcionario.primer_nombre} {ausencia.funcionario.primer_apellido}
                    </CardDescription>
                  </div>
                  <Badge variant={ausencia.aprobado ? 'default' : (ausencia.activo ? 'outline' : 'destructive')}>
                    {ausencia.aprobado ? 'Aprobada' : (ausencia.activo ? 'Pendiente' : 'Rechazada')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Carnet: {ausencia.funcionario.numero_carnet}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(ausencia.fecha_inicio)} - {formatDate(ausencia.fecha_fin)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Solicitado: {formatDateTime(ausencia.created_at)}</span>
                  </div>
                    {/* <span>Solicitado: {formatDateTime(ausencia.fecha_solicitud)}</span> */}
                  {ausencia.descripcion && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 mt-0.5" />
                      <span className="line-clamp-2">{ausencia.descripcion}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
K
      {/* Pagination Info */}
      {pagination && pagination.total > pagination.per_page && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} de {pagination.total} ausencias
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Página {pagination.current_page} de {pagination.last_page}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}