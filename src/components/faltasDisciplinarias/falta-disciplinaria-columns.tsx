"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Edit, MoreHorizontal, Trash2, Eye, Download } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { FaltaDisciplinaria } from "@/types/falta-disciplinaria.types";
import { getToken } from '@/store/auth.store';
import { useFaltaDisciplinariaStore } from "@/store/falta-disciplinaria.store";
import { useRestoreFaltaDisciplinaria } from '@/hooks/falta-disciplinaria.queries';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

function ActionsCell({ falta }: { falta: FaltaDisciplinaria }) {
  const { openEditDialog, openDeleteDialog } = useFaltaDisciplinariaStore();
  const restoreMutation = useRestoreFaltaDisciplinaria();
  const isDeleted = !!falta.deleted_at;

  const [openRestore, setOpenRestore] = useState(false);
  const restoring = restoreMutation.status === 'pending';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {!isDeleted && (
            <>
              <DropdownMenuItem onClick={() => openEditDialog(falta)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              {falta.pdf_respaldo_url && (
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      const token = getToken();
                      if (!token) {
                        console.warn('No hay sesión activa');
                        return;
                      }

                      const res = await fetch(`/api/auth/faltas-disciplinarias/${falta.id}/pdf`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });

                      if (!res.ok) {
                        console.error('No se pudo descargar el PDF');
                        return;
                      }

                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      window.open(url, '_blank');
                      setTimeout(() => URL.revokeObjectURL(url), 60_000);
                    } catch (err) {
                      console.error('Error al descargar el PDF:', err);
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => openDeleteDialog(falta)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </>
          )}
          {isDeleted && (
            <>
              <DropdownMenuItem
                onClick={() => setOpenRestore(true)}
                className="text-green-600 focus:text-green-600"
              >
                <Eye className="mr-2 h-4 w-4" />
                Restaurar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de confirmación para restaurar */}
      <Dialog open={openRestore} onOpenChange={setOpenRestore}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurar falta disciplinaria</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas restaurar la falta #{falta.id}? Esta acción revertirá la eliminación.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={restoring}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              variant="default"
              onClick={() => {
                restoreMutation.mutate(falta.id);
                setOpenRestore(false);
              }}
              disabled={restoring}
            >
              {restoring ? 'Restaurando...' : 'Restaurar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns: ColumnDef<FaltaDisciplinaria>[] = [
  {
    id: "funcionario",
    accessorKey: "funcionario.nombre_completo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Funcionario
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const funcionario = row.original.funcionario;
      return (
        <div className="font-medium">
          {funcionario.nombre_completo}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const funcionario = row.original.funcionario;
      const searchValue = String(value).toLowerCase();
      const documento = funcionario.documento || '';
      return (
        funcionario.nombre_completo.toLowerCase().includes(searchValue) ||
        documento.toLowerCase().includes(searchValue)
      );
    },
  },
  {
    accessorKey: "tipo_gravedad",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Gravedad
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const gravedad = row.getValue("tipo_gravedad") as string;

      const getGravedadColor = (gravedad: string) => {
        switch (gravedad) {
          case "Leve":
            return "bg-green-100 text-green-800 border-green-200";
          case "Grave":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
          case "Muy Grave":
            return "bg-red-100 text-red-800 border-red-200";
          default:
            return "bg-gray-100 text-gray-800 border-gray-200";
        }
      };

      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getGravedadColor(gravedad)}`}>
          {gravedad}
        </span>
      );
    },
  },
  {
    accessorKey: "fecha_falta",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de Falta
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fechaFalta = row.getValue("fecha_falta") as string;

      const formatDateFromString = (dateString: string): string => {
        try {
          let date: Date;
          if (dateString.includes('T')) {
            date = new Date(dateString);
          } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split('-').map(Number);
            date = new Date(year, month - 1, day);
          } else {
            date = new Date(dateString);
          }
          if (isNaN(date.getTime())) {
            return dateString;
          }
          return format(date, "dd/MM/yyyy HH:mm", { locale: es });
        } catch {
          return dateString;
        }
      };

      return (
        <div className="text-sm">
          {formatDateFromString(fechaFalta)}
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = new Date(rowA.getValue(columnId) as string);
      const dateB = new Date(rowB.getValue(columnId) as string);
      return dateA.getTime() - dateB.getTime();
    },
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => {
      const descripcion = row.getValue("descripcion") as string;
      return (
        <div className="max-w-[300px] truncate" title={descripcion}>
          {descripcion}
        </div>
      );
    },
  },
  {
    accessorKey: "deleted_at",
    header: "Estado",
    cell: ({ row }) => {
      const deletedAt = row.getValue("deleted_at") as string | null;

      if (deletedAt) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-200">
            Eliminado
          </span>
        );
      }

      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
          Activo
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha Registro
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at") as string;

      const formatDateFromString = (dateString: string): string => {
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            return dateString;
          }
          return format(date, "dd/MM/yyyy HH:mm", { locale: es });
        } catch {
          return dateString;
        }
      };

      return (
        <div className="text-sm text-muted-foreground">
          {formatDateFromString(createdAt)}
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = new Date(rowA.getValue(columnId) as string);
      const dateB = new Date(rowB.getValue(columnId) as string);
      return dateA.getTime() - dateB.getTime();
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: (props) => <ActionsCell falta={props.row.original} />,
  },
];