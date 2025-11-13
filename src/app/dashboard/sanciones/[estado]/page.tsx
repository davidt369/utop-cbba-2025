"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle, Calendar, User, FileText, Shield } from "lucide-react"
import Link from "next/link"
import { useDashboard, type SancionDetalle } from '@/hooks/useDashboard'

const estadoLabels: Record<string, string> = {
  'activas': 'Sanciones Activas',
  'cumplidas': 'Sanciones Cumplidas',
  'suspendidas': 'Sanciones Suspendidas'
}

const estadoBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  'activa': 'destructive',
  'cumplida': 'default',
  'suspendida': 'secondary'
}

const tipoLabels: Record<string, string> = {
  'amonestacion': 'Amonestación',
  'suspension': 'Suspensión',
  'multa': 'Multa',
  'destitucion': 'Destitución'
}

export default function SancionesEstadoPage() {
  const params = useParams()
  const estado = params.estado as string
  const { fetchSancionesByEstado } = useDashboard()
  
  const [sanciones, setSanciones] = useState<SancionDetalle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    const loadSanciones = async () => {
      setLoading(true)
      setError(null)
      
      const result = await fetchSancionesByEstado(estado)
      if (result) {
        setSanciones(result.data)
        setPagination(result.pagination)
      } else {
        setError('Error al cargar las sanciones')
      }
      setLoading(false)
    }

    if (estado) {
      loadSanciones()
    }
  }, [estado, fetchSancionesByEstado])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES')
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
              {estadoLabels[estado] || 'Sanciones'}
            </h1>
          </div>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <p>Error al cargar las sanciones: {error}</p>
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
            {estadoLabels[estado] || 'Sanciones'}
          </h1>
          <p className="text-muted-foreground">
            {pagination ? `${pagination.total} sanciones encontradas` : 'Listado de sanciones'}
          </p>
        </div>
      </div>

      {/* Sanciones Grid */}
      {sanciones.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay sanciones
              </h3>
              <p className="text-muted-foreground">
                No se encontraron sanciones con el estado "{estado}".
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sanciones.map((sancion) => (
            <Card key={sancion.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {tipoLabels[sancion.tipo] || sancion.tipo}
                    </CardTitle>
                    <CardDescription>
                      {sancion.funcionario.primer_nombre} {sancion.funcionario.primer_apellido}
                    </CardDescription>
                  </div>
                  <Badge variant={estadoBadgeVariant[sancion.estado] || 'outline'}>
                    {sancion.estado}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Carnet: {sancion.funcionario.numero_carnet}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Inicio: {formatDate(sancion.fecha_inicio)}
                      {sancion.fecha_fin && ` - Fin: ${formatDate(sancion.fecha_fin)}`}
                    </span>
                  </div>
                  
                  {sancion.falta_disciplinaria && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 mt-0.5" />
                      <span className="line-clamp-2">
                        Falta: {sancion.falta_disciplinaria.descripcion}
                      </span>
                    </div>
                  )}
                  
                  {sancion.descripcion && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 mt-0.5" />
                      <span className="line-clamp-2">{sancion.descripcion}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Info */}
      {pagination && pagination.total > pagination.per_page && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} de {pagination.total} sanciones
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