'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  PlayCircle,
  XCircle 
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MiComision } from '@/types/mis-comisiones.types';

interface MisComisionesTableProps {
  comisiones: MiComision[];
  isLoading?: boolean;
}

const getEstadoBadge = (estado: MiComision['estado']) => {
  switch (estado) {
    case 'programada':
      return <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Programada
      </Badge>;
    case 'en_curso':
      return <Badge variant="default" className="flex items-center gap-1">
        <PlayCircle className="h-3 w-3" />
        En Curso
      </Badge>;
    case 'finalizada':
      return <Badge variant="outline" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Finalizada
      </Badge>;
    case 'vencida':
      return <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Vencida
      </Badge>;
    default:
      return <Badge variant="secondary">
        {estado}
      </Badge>;
  }
};

const getDiasRestantesBadge = (diasRestantes: number, estado: MiComision['estado']) => {
  if (estado === 'finalizada' || estado === 'vencida') {
    return null;
  }

  if (diasRestantes <= 0) {
    return <Badge variant="destructive" className="text-xs">Vencido</Badge>;
  }

  if (diasRestantes <= 3) {
    return <Badge variant="destructive" className="text-xs">
      {diasRestantes} días
    </Badge>;
  }

  if (diasRestantes <= 7) {
    return <Badge variant="outline" className="text-xs">
      {diasRestantes} días
    </Badge>;
  }

  return <Badge variant="secondary" className="text-xs">
    {diasRestantes} días
  </Badge>;
};

export function MisComisionesTable({ comisiones, isLoading }: MisComisionesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Comisiones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!comisiones || comisiones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Comisiones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No tienes comisiones registradas
            </h3>
            <p className="text-sm text-muted-foreground">
              Cuando tengas comisiones asignadas aparecerán aquí
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Mis Comisiones ({comisiones.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Fecha Fin</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Días Restantes</TableHead>
                <TableHead>Creado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comisiones.map((comision) => (
                <TableRow key={comision.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="font-medium truncate">
                        {comision.descripcion || 'Sin descripción'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(comision.fecha_inicio + 'T00:00:00'), "dd/MM/yyyy", { locale: es })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(comision.fecha_fin + 'T00:00:00'), "dd/MM/yyyy", { locale: es })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getEstadoBadge(comision.estado)}
                  </TableCell>
                  <TableCell>
                    {getDiasRestantesBadge(comision.dias_restantes, comision.estado)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(comision.created_at), "dd/MM/yyyy", { locale: es })}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}