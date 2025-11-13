"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HistorialAuditoria } from "@/components/auditoria/historial-auditoria"
import { EstadisticasAuditoria } from "@/components/auditoria/estadisticas-auditoria"
import { BuscadorFuncionario } from "@/components/auditoria/buscador-funcionario"
import { ProtectedRoute } from "@/components/protected-route"
import {
  History,
  BarChart3,
  Search,
  User,
  Clock,
  Activity,
  FileText,
  Shield
} from "lucide-react"

interface Funcionario {
  id: number
  nombres: string
  apellidos: string
  ci: string
  estado?: string
  cargo_actual?: string
}

export default function AuditoriaPage() {
  const [funcionarioSeleccionado, setFuncionarioSeleccionado] = useState<Funcionario | null>(null)
  const [tabActiva, setTabActiva] = useState("historial")

  return (
    <ProtectedRoute>
      <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-6 sm:py-8 space-y-8">
        {/* Header principal */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Sistema de Auditoría
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground">
                Historial completo de cambios en asignaciones de cargos
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Seguimiento en tiempo real</span>
            </div>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Registro automático</span>
            </div>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Trazabilidad completa</span>
            </div>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-sm text-muted-foreground">Disponibilidad</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <p className="text-sm text-muted-foreground">Monitoreo</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <p className="text-sm text-muted-foreground">Trazabilidad</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">0ms</div>
              <p className="text-sm text-muted-foreground">Latencia</p>
            </CardContent>
          </Card>
        </div>

        {/* Navegación principal */}
        <Tabs value={tabActiva} onValueChange={setTabActiva} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:w-[350px] md:w-[400px] mx-auto">
            <TabsTrigger value="historial" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Historial de Eventos
            </TabsTrigger>
            <TabsTrigger value="estadisticas" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="historial" className="space-y-6">
            {/* Búsqueda de funcionario específico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Consulta Específica
                </CardTitle>
                <CardDescription>
                  Buscar el historial de un funcionario en particular
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BuscadorFuncionario
                  onSeleccionar={setFuncionarioSeleccionado}
                  funcionarioSeleccionado={funcionarioSeleccionado}
                  placeholder="Buscar funcionario por nombre, apellido o CI..."
                />
              </CardContent>
            </Card>

            {/* Componente principal del historial */}
            <HistorialAuditoria
              funcionarioId={funcionarioSeleccionado?.id}
              mostrarFiltros={true}
              limite={20}
            />
          </TabsContent>

          <TabsContent value="estadisticas">
            <EstadisticasAuditoria />
          </TabsContent>
        </Tabs>

        {/* Información adicional */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Información del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">¿Qué se registra?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Fecha y hora exacta de cada cambio</li>
                  <li>• Usuario responsable del cambio</li>
                  <li>• Valores anteriores y nuevos</li>
                  <li>• Tipo de operación realizada</li>
                  <li>• Descripción detallada del evento</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Tipos de eventos</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Creación
                  </Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    Actualización
                  </Badge>
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    Eliminación
                  </Badge>
                  <Badge variant="outline" className="text-purple-600 border-purple-200">
                    Restauración
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}