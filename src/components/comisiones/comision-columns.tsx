import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, Trash2, FileText, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Comision } from '@/types/comision.types';
import { useComisionStore } from '@/store/comision.store';
import { useRestoreComision } from '@/hooks/comision.queries';

export const columns: ColumnDef<Comision>[] = [
  {
    accessorKey: 'descripcion',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Descripción
          {column.getIsSorted() === "asc" ? (
            <span className="ml-2 h-4 w-4">↑</span>
          ) : column.getIsSorted() === "desc" ? (
            <span className="ml-2 h-4 w-4">↓</span>
          ) : (
            <span className="ml-2 h-4 w-4 opacity-50">↕</span>
          )}
        </Button>
      )
    },
  },
  {
    accessorKey: 'funcionario.nombre_completo',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Funcionario
          {column.getIsSorted() === "asc" ? (
            <span className="ml-2 h-4 w-4">↑</span>
          ) : column.getIsSorted() === "desc" ? (
            <span className="ml-2 h-4 w-4">↓</span>
          ) : (
            <span className="ml-2 h-4 w-4 opacity-50">↕</span>
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      return row.original.funcionario?.nombre_completo || 'Sin asignar';
    },
  },
  {
    accessorKey: 'fecha_inicio',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Fecha Inicio
          {column.getIsSorted() === "asc" ? (
            <span className="ml-2 h-4 w-4">↑</span>
          ) : column.getIsSorted() === "desc" ? (
            <span className="ml-2 h-4 w-4">↓</span>
          ) : (
            <span className="ml-2 h-4 w-4 opacity-50">↕</span>
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.original.fecha_inicio);
      return format(date, 'dd/MM/yyyy', { locale: es });
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.fecha_inicio);
      const dateB = new Date(rowB.original.fecha_inicio);
      return dateA.getTime() - dateB.getTime();
    },
  },
  {
    accessorKey: 'fecha_fin',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Fecha Fin
          {column.getIsSorted() === "asc" ? (
            <span className="ml-2 h-4 w-4">↑</span>
          ) : column.getIsSorted() === "desc" ? (
            <span className="ml-2 h-4 w-4">↓</span>
          ) : (
            <span className="ml-2 h-4 w-4 opacity-50">↕</span>
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.original.fecha_fin);
      return format(date, 'dd/MM/yyyy', { locale: es });
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.fecha_fin);
      const dateB = new Date(rowB.original.fecha_fin);
      return dateA.getTime() - dateB.getTime();
    },
  },
  {
    accessorKey: 'estado_comision',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Estado
          {column.getIsSorted() === "asc" ? (
            <span className="ml-2 h-4 w-4">↑</span>
          ) : column.getIsSorted() === "desc" ? (
            <span className="ml-2 h-4 w-4">↓</span>
          ) : (
            <span className="ml-2 h-4 w-4 opacity-50">↕</span>
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const estado = row.original.estado_comision;
      const esActiva = row.original.es_activa;
      const diasRestantes = row.original.dias_restantes;

      // Colores y textos según el estado calculado automáticamente
      const estadoConfig = {
        'programada': {
          className: 'bg-blue-100 text-blue-800',
          texto: 'Programada'
        },
        'activa': {
          className: 'bg-green-100 text-green-800',
          texto: 'Activa'
        },
        'finalizada': {
          className: 'bg-gray-100 text-gray-800',
          texto: 'Finalizada'
        },
        'eliminada': {
          className: 'bg-red-100 text-red-800',
          texto: 'Eliminada'
        }
      };

      const config = estadoConfig[estado] || estadoConfig['finalizada'];

      return (
        <div className="flex flex-col space-y-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
            {config.texto}
          </span>
          {esActiva && diasRestantes > 0 && (
            <span className="text-xs text-muted-foreground">
              {diasRestantes} días restantes
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'pdf_respaldo_url',
    header: 'PDF',
    cell: ({ row }) => {
      const comision = row.original;
      if (!comision.pdf_respaldo_url) {
        return <span className="text-gray-400 text-sm">Sin PDF</span>;
      }
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`/api/auth/comisiones/${comision.id}/pdf`, '_blank')}
          className="h-7 px-2"
        >
          <FileText className="h-3 w-3 mr-1" />
          Ver PDF
        </Button>
      );
    },
  },
  {
    id: 'actions',
    accessorKey: 'id',
    header: 'Acciones',
    cell: ({ row }) => {
      const comision = row.original;
      const { openEditDialog, openDeleteDialog } = useComisionStore();
      const restoreComisionMutation = useRestoreComision();
      const isDeleted = !!comision.deleted_at;

      const handleRestore = () => {
        restoreComisionMutation.mutate(comision.id);
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            {comision.pdf_respaldo_url && (
              <DropdownMenuItem onClick={() => window.open(`/api/auth/comisiones/${comision.id}/pdf`, '_blank')}>
                <FileText className="mr-2 h-4 w-4" />
                Ver PDF
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {!isDeleted && (
              <>
                <DropdownMenuItem onClick={() => openEditDialog(comision)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openDeleteDialog(comision)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
            {isDeleted && (
              <DropdownMenuItem
                onClick={handleRestore}
                className="text-green-600 focus:text-green-600"
                disabled={restoreComisionMutation.isPending}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {restoreComisionMutation.isPending ? 'Restaurando...' : 'Restaurar'}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
