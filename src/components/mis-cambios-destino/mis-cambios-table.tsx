"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Calendar, Clock, FileText, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CambioDestino } from "@/hooks/mis-cambios-destino.queries";

interface MisCambiosTableProps {
  cambios: CambioDestino[];
  isLoading?: boolean;
}

const getEstadoColor = (activo: boolean) => {
  return activo 
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-gray-100 text-gray-800 border-gray-200';
};

const getEstadoIcon = (activo: boolean) => {
  return activo ? '✅' : '⏹️';
};

export function MisCambiosTable({ cambios, isLoading = false }: MisCambiosTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Cambios de Destino
          </CardTitle>
          <CardDescription>
            Cargando información de cambios de destino...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="h-4 bg-muted/50 dark:bg-muted/30 rounded animate-pulse w-24"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted/50 dark:bg-muted/30 rounded animate-pulse w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted/50 dark:bg-muted/30 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="h-6 bg-muted/50 dark:bg-muted/30 rounded animate-pulse w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Historial de Cambios de Destino
        </CardTitle>
        <CardDescription>
          Registro completo de cambios de destino en tu carrera profesional
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cambios.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-blue-500 mb-4" />
            <h3 className="text-lg font-medium text-blue-600 mb-2">
              Sin cambios de destino registrados
            </h3>
            <p className="text-muted-foreground">
              No tienes cambios de destino registrados en tu expediente. Tu asignación actual se mantiene estable.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Fecha</TableHead>
                  <TableHead className="w-[100px]">Estado</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="w-[120px]">Registrado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cambios.map((cambio) => (
                  <TableRow key={cambio.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(cambio.fecha_destino + 'T00:00:00'), "dd/MM/yyyy", { locale: es })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getEstadoColor(cambio.activo)}
                      >
                        <span className="mr-1">{getEstadoIcon(cambio.activo)}</span>
                        {cambio.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-blue-700">
                          {cambio.unidad_destino || 'No especificado'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cambio.unidad_anterior ? (
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {cambio.unidad_anterior}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Asignación inicial</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm leading-relaxed">
                          {cambio.motivo_cambio}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(cambio.created_at), "dd/MM/yyyy", { locale: es })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}