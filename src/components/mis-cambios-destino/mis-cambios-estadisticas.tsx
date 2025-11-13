"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MapPin, Calendar, CheckCircle } from "lucide-react";
import { EstadisticasCambios } from "@/hooks/mis-cambios-destino.queries";

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

interface MisCambiosEstadisticasProps {
  estadisticas: EstadisticasCambios;
  isLoading?: boolean;
}

export function MisCambiosEstadisticas({ estadisticas, isLoading = false }: MisCambiosEstadisticasProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <EstadisticaCard
          title="Total de Cambios"
          value={estadisticas.total}
          description="Cambios de destino registrados"
          icon={MapPin}
          variant={estadisticas.total === 0 ? "success" : "default"}
        />
        
        <EstadisticaCard
          title="Destinos Activos"
          value={estadisticas.activos}
          description="Cambios actualmente vigentes"
          icon={CheckCircle}
          variant={estadisticas.activos > 0 ? "success" : "default"}
        />
        
        <EstadisticaCard
          title="Destinos Inactivos"
          value={estadisticas.inactivos}
          description="Cambios finalizados"
          icon={Calendar}
          variant="default"
        />
      </div>

      {/* Distribución detallada si hay cambios */}
      {estadisticas.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribución de Cambios</CardTitle>
            <CardDescription>
              Estado actual de tus cambios de destino
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Activos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {estadisticas.activos}
                  </span>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {estadisticas.total > 0 
                      ? Math.round((estadisticas.activos / estadisticas.total) * 100)
                      : 0}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm font-medium">Inactivos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {estadisticas.inactivos}
                  </span>
                  <Badge variant="outline" className="text-gray-600 border-gray-200">
                    {estadisticas.total > 0 
                      ? Math.round((estadisticas.inactivos / estadisticas.total) * 100)
                      : 0}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensaje motivacional si no hay cambios */}
      {estadisticas.total === 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-blue-700 mb-2">
                No hay cambios de destino registrados
              </h3>
              <p className="text-sm text-blue-600">
                Tu asignación actual se mantiene estable. Los cambios de destino aparecerán aquí cuando sean procesados.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}