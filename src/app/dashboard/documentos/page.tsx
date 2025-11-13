"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  CheckCircle,
  Clock,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Plus,
  User,
  MapPin,
  Camera,
  Shield,
  CreditCard
} from "lucide-react";

import { DocumentoTable } from "@/components/documentos/documento-table";
import { DocumentoDialogs } from "@/components/documentos/documento-dialogs";
import { useDocumentoEstadisticas } from "@/hooks/documento.queries";
import { useDocumentoStore } from "@/store/documento.store";

interface EstadisticaCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  color?: string;
}

function EstadisticaCard({ title, value, description, icon: Icon, color = "text-muted-foreground" }: EstadisticaCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DocumentosPage() {
  const { data: estadisticas, isLoading: isLoadingEstadisticas } = useDocumentoEstadisticas();
  const { openCreateDialog, showDeleted, setShowDeleted } = useDocumentoStore();

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Documentos</h2>
          <p className="text-muted-foreground">
            Administra los documentos de los funcionarios del sistema
          </p>
        </div>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Documento
        </Button>
      </div>

      {/* Estadísticas */}
      {isLoadingEstadisticas ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted/50 dark:bg-muted/30 rounded animate-pulse w-24"></div>
                <div className="h-4 w-4 bg-muted/50 dark:bg-muted/30 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted/50 dark:bg-muted/30 rounded animate-pulse w-16 mb-2"></div>
                <div className="h-3 bg-muted/50 dark:bg-muted/30 rounded animate-pulse w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : estadisticas ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <EstadisticaCard
            title="Total de Documentos"
            value={estadisticas.total}
            description="Documentos registrados en el sistema"
            icon={FileText}
          />
          <EstadisticaCard
            title="Documentos Aprobados"
            value={estadisticas.aprobados}
            description="Documentos validados y aprobados"
            icon={CheckCircle}
            color="text-green-600"
          />
          <EstadisticaCard
            title="Documentos Pendientes"
            value={estadisticas.pendientes}
            description="Documentos esperando aprobación"
            icon={Clock}
            color="text-yellow-600"
          />
          <EstadisticaCard
            title="Documentos Eliminados"
            value={estadisticas.eliminados}
            description="Documentos eliminados del sistema"
            icon={Trash2}
            color="text-red-600"
          />
        </div>
      ) : null}

      {/* Estadísticas por tipo y funcionarios */}
      {estadisticas && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {/* Distribución por tipo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribución por Tipo</CardTitle>
              <CardDescription>
                Cantidad de documentos por cada tipo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Foto de perfil</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {estadisticas.por_tipo["Foto de perfil"] || 0}
                    </span>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      {estadisticas.total > 0
                        ? Math.round(((estadisticas.por_tipo["Foto de perfil"] || 0) / estadisticas.total) * 100)
                        : 0}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Memorandum destino</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {estadisticas.por_tipo["Memorandum destino"] || 0}
                    </span>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {estadisticas.total > 0
                        ? Math.round(((estadisticas.por_tipo["Memorandum destino"] || 0) / estadisticas.total) * 100)
                        : 0}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Foto ubicación / croquis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {estadisticas.por_tipo["Foto ubicación / croquis"] || 0}
                    </span>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                      {estadisticas.total > 0
                        ? Math.round(((estadisticas.por_tipo["Foto ubicación / croquis"] || 0) / estadisticas.total) * 100)
                        : 0}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full">
                      <Camera className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Foto AVC04</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {estadisticas.por_tipo["Foto AVC04"] || 0}
                    </span>
                    <Badge variant="outline" className="text-purple-600 border-purple-200">
                      {estadisticas.total > 0
                        ? Math.round(((estadisticas.por_tipo["Foto AVC04"] || 0) / estadisticas.total) * 100)
                        : 0}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full">
                      <Shield className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Sigep</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {estadisticas.por_tipo["Sigep"] || 0}
                    </span>
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      {estadisticas.total > 0
                        ? Math.round(((estadisticas.por_tipo["Sigep"] || 0) / estadisticas.total) * 100)
                        : 0}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Foto carnet</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {estadisticas.por_tipo["Foto carnet"] || 0}
                    </span>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      {estadisticas.total > 0
                        ? Math.round(((estadisticas.por_tipo["Foto carnet"] || 0) / estadisticas.total) * 100)
                        : 0}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado de funcionarios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado de Funcionarios</CardTitle>
              <CardDescription>
                Funcionarios con documentación completa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-green-800">
                        Documentación Completa
                      </div>
                      <div className="text-xs text-green-600">
                        Funcionarios con los 4 tipos de documentos
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {estadisticas.funcionarios_completos}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full">
                      <UserX className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-yellow-800">
                        Documentación Pendiente
                      </div>
                      <div className="text-xs text-yellow-600">
                        Funcionarios con documentos faltantes
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    {estadisticas.funcionarios_pendientes}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}


      {/* Filtros y tabla */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Lista de Documentos</CardTitle>
              <CardDescription>
                Gestiona todos los documentos del sistema
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showDeleted"
                checked={showDeleted}
                onCheckedChange={setShowDeleted}
              />
              <label
                htmlFor="showDeleted"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Solo eliminados
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <DocumentoTable showDeleted={showDeleted} setShowDeleted={setShowDeleted} />
          </div>
        </CardContent>
      </Card>

      {/* Diálogos */}
      <DocumentoDialogs />
    </div>
  );
}