"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle, TrendingUp, Users, Calendar } from "lucide-react";

import { FaltaDisciplinariaTable } from "@/components/faltasDisciplinarias/falta-disciplinaria-table";
import { useFaltaDisciplinariaEstadisticas } from "@/hooks/falta-disciplinaria.queries";
import { useFaltaDisciplinariaStore } from "@/store/falta-disciplinaria.store";

interface EstadisticaCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function EstadisticaCard({ title, value, description, icon: Icon, trend }: EstadisticaCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <Badge
              variant={trend.isPositive ? "destructive" : "secondary"}
              className="text-xs"
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </Badge>
            <span className="text-xs text-muted-foreground ml-2">
              {trend.isPositive ? "más que el mes anterior" : "menos que el mes anterior"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function FaltasDisciplinariasPage() {
  const { showDeleted, setShowDeleted } = useFaltaDisciplinariaStore();
  const { data: estadisticas, isLoading: isLoadingEstadisticas } = useFaltaDisciplinariaEstadisticas();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Faltas Disciplinarias</h2>
          <p className="text-muted-foreground">
            Gestión y seguimiento de faltas disciplinarias del personal
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      {isLoadingEstadisticas ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EstadisticaCard
            title="Total de Faltas"
            value={estadisticas.total}
            description="Faltas registradas en el sistema"
            icon={AlertTriangle}
          />

          <EstadisticaCard
            title="Faltas Eliminadas"
            value={estadisticas.eliminadas}
            description="Faltas eliminadas del sistema"
            icon={Calendar}
          />

          <EstadisticaCard
            title="Funcionarios Afectados"
            value={estadisticas.funcionarios_con_faltas}
            description="Funcionarios con al menos una falta"
            icon={Users}
          />

          <EstadisticaCard
            title="Promedio por Funcionario"
            value={estadisticas.funcionarios_con_faltas > 0
              ? (estadisticas.total / estadisticas.funcionarios_con_faltas).toFixed(1)
              : "0.0"
            }
            description="Promedio de faltas por funcionario"
            icon={TrendingUp}
          />
        </div>
      ) : null}



      {/* Distribución por Gravedad */}
      {estadisticas && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribución por Gravedad</CardTitle>
              <CardDescription>
                Clasificación de faltas según su nivel de gravedad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Leves</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {estadisticas.por_gravedad["Leve"] || 0}
                    </span>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {estadisticas.total > 0
                        ? Math.round(((estadisticas.por_gravedad["Leve"] || 0) / estadisticas.total) * 100)
                        : 0}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Graves</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {estadisticas.por_gravedad["Grave"] || 0}
                    </span>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                      {estadisticas.total > 0
                        ? Math.round(((estadisticas.por_gravedad["Grave"] || 0) / estadisticas.total) * 100)
                        : 0}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">Muy Graves</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {estadisticas.por_gravedad["Muy Grave"] || 0}
                    </span>
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      {estadisticas.total > 0
                        ? Math.round(((estadisticas.por_gravedad["Muy Grave"] || 0) / estadisticas.total) * 100)
                        : 0}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funcionarios con más faltas */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Funcionarios con Más Faltas</CardTitle>
              <CardDescription>
                Ranking de funcionarios con mayor número de faltas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {estadisticas.faltas_por_funcionario && estadisticas.faltas_por_funcionario.length > 0 ? (
                <div className="space-y-3">
                  {estadisticas.faltas_por_funcionario.slice(0, 5).map((funcionario, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {funcionario.nombre_completo}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {funcionario.total_faltas} {funcionario.total_faltas === 1 ? 'falta' : 'faltas'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay faltas registradas</p>
                </div>
              )}
            </CardContent>

          </Card>
        </div>
      )}
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Configura qué faltas disciplinarias mostrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-deleted"
              checked={showDeleted}
              onCheckedChange={setShowDeleted}
            />
            <Label htmlFor="show-deleted" className="text-sm font-medium">
              Solo eliminadas
            </Label>
          </div>
        </CardContent>
      </Card>
      {/* Tabla de Faltas Disciplinarias */}
      <FaltaDisciplinariaTable showDeleted={showDeleted} />
    </div>
  );
}