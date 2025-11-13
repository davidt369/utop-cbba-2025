"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { EstadisticasFaltas } from "@/hooks/mis-faltas-disciplinarias.queries";

interface EstadisticaCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  variant?: "default" | "success" | "warning" | "destructive";
}

function EstadisticaCard({ title, value, description, icon: Icon, variant = "default" }: EstadisticaCardProps) {
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case "success":
        return "border-green-200 bg-green-50/50";
      case "warning":
        return "border-yellow-200 bg-yellow-50/50";
      case "destructive":
        return "border-red-200 bg-red-50/50";
      default:
        return "border-border bg-card";
    }
  };

  const getIconStyles = (variant: string) => {
    switch (variant) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "destructive":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={getVariantStyles(variant)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${getIconStyles(variant)}`} />
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

interface MisFaltasEstadisticasProps {
  estadisticas: EstadisticasFaltas;
  isLoading?: boolean;
}

export function MisFaltasEstadisticas({ estadisticas, isLoading = false }: MisFaltasEstadisticasProps) {
  if (isLoading) {
    return (
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
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EstadisticaCard
          title="Total de Faltas"
          value={estadisticas.total}
          description="Faltas registradas en total"
          icon={AlertTriangle}
          variant={estadisticas.total === 0 ? "success" : estadisticas.total > 5 ? "destructive" : "warning"}
        />
        
        <EstadisticaCard
          title="Faltas Leves"
          value={estadisticas.leves}
          description="Infracciones menores"
          icon={Calendar}
          variant={estadisticas.leves === 0 ? "success" : "warning"}
        />
        
        <EstadisticaCard
          title="Faltas Graves"
          value={estadisticas.graves}
          description="Infracciones importantes"
          icon={TrendingUp}
          variant={estadisticas.graves === 0 ? "success" : "destructive"}
        />
        
        <EstadisticaCard
          title="Faltas Muy Graves"
          value={estadisticas.muy_graves}
          description="Infracciones severas"
          icon={AlertTriangle}
          variant={estadisticas.muy_graves === 0 ? "success" : "destructive"}
        />
      </div>

      {/* Distribución detallada si hay faltas */}
      {estadisticas.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribución por Gravedad</CardTitle>
            <CardDescription>
              Clasificación de tus faltas según su nivel de gravedad
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
                    {estadisticas.leves}
                  </span>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {estadisticas.total > 0 
                      ? Math.round((estadisticas.leves / estadisticas.total) * 100)
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
                    {estadisticas.graves}
                  </span>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                    {estadisticas.total > 0 
                      ? Math.round((estadisticas.graves / estadisticas.total) * 100)
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
                    {estadisticas.muy_graves}
                  </span>
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    {estadisticas.total > 0 
                      ? Math.round((estadisticas.muy_graves / estadisticas.total) * 100)
                      : 0}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensaje motivacional si no hay faltas */}
      {estadisticas.total === 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                ¡Excelente Desempeño Disciplinario!
              </h3>
              <p className="text-sm text-green-600">
                Mantén este excelente comportamiento. Tu historial disciplinario limpio demuestra tu profesionalismo y compromiso con la institución.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}