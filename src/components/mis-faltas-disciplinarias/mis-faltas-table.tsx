"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Calendar, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FaltaDisciplinaria } from "@/hooks/mis-faltas-disciplinarias.queries";

interface MisFaltasTableProps {
  faltas: FaltaDisciplinaria[];
  isLoading?: boolean;
}

const getGravedadColor = (gravedad: string) => {
  switch (gravedad) {
    case 'Leve':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Grave':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Muy Grave':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getGravedadIcon = (gravedad: string) => {
  switch (gravedad) {
    case 'Leve':
      return '⚠️';
    case 'Grave':
      return '🚨';
    case 'Muy Grave':
      return '🔴';
    default:
      return '❓';
  }
};

export function MisFaltasTable({ faltas, isLoading = false }: MisFaltasTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Faltas Disciplinarias
          </CardTitle>
          <CardDescription>
            Cargando información de faltas disciplinarias...
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
          Historial de Faltas Disciplinarias
        </CardTitle>
        <CardDescription>
          Registro completo de faltas disciplinarias registradas en tu expediente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {faltas.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-green-600 mb-2">
              ¡Excelente historial!
            </h3>
            <p className="text-muted-foreground">
              No tienes faltas disciplinarias registradas en tu expediente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Fecha</TableHead>
                  <TableHead className="w-[120px]">Gravedad</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-[120px]">Registrada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faltas.map((falta) => (
                  <TableRow key={falta.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(falta.fecha_falta), "dd/MM/yyyy", { locale: es })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getGravedadColor(falta.tipo_gravedad)}
                      >
                        <span className="mr-1">{getGravedadIcon(falta.tipo_gravedad)}</span>
                        {falta.tipo_gravedad}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm leading-relaxed">
                          {falta.descripcion}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(falta.created_at), "dd/MM/yyyy", { locale: es })}
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