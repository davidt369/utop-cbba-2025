'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Edit,
  Trash2,
  MoreHorizontal,
  RotateCcw,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Ausencia } from '@/types/ausencia.types';
import useAusenciaStore from '@/store/ausencias.store';
import { formatDate, cn } from '@/lib/utils';
import { PDFLink } from './pdf-viewer';
import { useAusenciasTable } from '@/hooks/use-ausencias-table';
import { TablePagination } from './table-pagination';

interface AusenciaTableProps {
  ausencias: Ausencia[];
  isLoading?: boolean;
}

export default function AusenciaTable({ ausencias, isLoading }: AusenciaTableProps) {
  const {
    sortField,
    sortDirection,
    toggleSort,
    openEditDialog,
    openDeleteDialog,
  } = useAusenciaStore();

  // Usar el hook personalizado para filtrado, ordenamiento y paginación
  const { ausencias: paginatedAusencias, filteredTotal, paginationInfo } = useAusenciasTable(ausencias);

  // Función para crear el botón de ordenamiento
  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => {
    const isActive = sortField === field;
    const direction = isActive ? sortDirection : null;

    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 font-semibold hover:bg-transparent"
        onClick={() => toggleSort(field)}
      >
        <span className="flex items-center gap-1">
          {children}
          {isActive ? (
            direction === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-50" />
          )}
        </span>
      </Button>
    );
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Permiso':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Baja Médica':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Vacaciones':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoBadge = (ausencia: Ausencia) => {
    if (ausencia.deleted_at) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
          <Trash2 className="mr-1 h-3 w-3" />
          Eliminado
        </Badge>
      );
    }

    if (!ausencia.activo) {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-600 border-orange-300">
          <XCircle className="mr-1 h-3 w-3" />
          Inactivo
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-green-100 text-green-600 border-green-300">
        <CheckCircle className="mr-1 h-3 w-3" />
        Activo
      </Badge>
    );
  };

  const getAprobadoBadge = (aprobado: boolean) => {
    if (aprobado) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-600 border-green-300">
          <CheckCircle className="mr-1 h-3 w-3" />
          Aprobado
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-600 border-yellow-300">
        <Clock className="mr-1 h-3 w-3" />
        Pendiente
      </Badge>
    );
  };

  const calculateDuration = (fechaInicio: string, fechaFin: string) => {
    // Usar el mismo método que en utils.ts para evitar problemas de zona horaria
    const parseDate = (dateStr: string) => {
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day); // month es 0-based
      }
      return new Date(dateStr);
    };

    const inicio = parseDate(fechaInicio);
    const fin = parseDate(fechaFin);
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionario</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Aprobación</TableHead>
              <TableHead>PDF</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
                </TableCell>
                <TableCell>
                  <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                </TableCell>
                <TableCell>
                  <div className="animate-pulse bg-gray-200 h-4 w-28 rounded"></div>
                </TableCell>
                <TableCell>
                  <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                </TableCell>
                <TableCell>
                  <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                </TableCell>
                <TableCell>
                  <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                </TableCell>
                <TableCell>
                  <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
                </TableCell>
                <TableCell>
                  <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (paginatedAusencias.length === 0 && !isLoading) {
    return (
      <div className="border rounded-md">
        <div className="p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron ausencias</h3>
          <p className="text-muted-foreground mb-4">
            {filteredTotal === 0
              ? "No hay ausencias que coincidan con los filtros actuales."
              : "No hay más resultados en esta página."
            }
          </p>
        </div>
        <TablePagination {...paginationInfo} />
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="funcionario">Funcionario</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="tipo">Tipo</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="fecha_inicio">Período</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="duracion">Duración</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="estado">Estado</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="aprobado">Aprobación</SortButton>
            </TableHead>
            <TableHead>PDF</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedAusencias.map((ausencia: Ausencia) => (
            <TableRow
              key={ausencia.id}
              className={ausencia.deleted_at ? 'opacity-60 bg-muted/20' : ''}
            >
              <TableCell>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {ausencia.funcionario?.nombre_completo || 'No asignado'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ausencia.funcionario?.numero_carnet}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="outline" className={getTipoColor(ausencia.tipo_ausencia)}>
                  {ausencia.tipo_ausencia}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">
                    <strong>Inicio:</strong> {formatDate(ausencia.fecha_inicio)}
                  </div>
                  <div className="text-sm">
                    <strong>Fin:</strong> {formatDate(ausencia.fecha_fin)}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {calculateDuration(ausencia.fecha_inicio, ausencia.fecha_fin)} días
                </Badge>
              </TableCell>

              <TableCell>
                {getEstadoBadge(ausencia)}
              </TableCell>

              <TableCell>
                {getAprobadoBadge(ausencia.aprobado)}
              </TableCell>

              <TableCell>
                {ausencia.pdf_respaldo_ruta ? (
                  <PDFLink
                    ausenciaId={ausencia.id}
                    pdfFileName={ausencia.pdf_respaldo_ruta.split('/').pop()}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">No hay PDF</span>
                )}
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      disabled={isLoading}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {ausencia.deleted_at ? (
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(ausencia)}
                        className="text-green-600"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restaurar
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem
                          onClick={() => openEditDialog(ausencia)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(ausencia)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Paginación */}
      <TablePagination {...paginationInfo} />
    </div>
  );
}