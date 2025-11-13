"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MoreHorizontal, Eye, Edit, Trash2, RotateCcw, Download, FileText, User, MapPin, Camera, Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDocumentoStore } from "@/store/documento.store";
import { useDeleteDocumento, useRestoreDocumento } from "@/hooks/documento.queries";
import type { Documento, TipoDocumento } from "@/types/documento.types";
import { toast } from "sonner";

// Mapeo de iconos por tipo de documento
const getIconByTipo = (tipo: TipoDocumento) => {
  switch (tipo) {
    case 'Foto de perfil':
      return <User className="h-4 w-4" />;
    case 'Memorandum destino':
      return <FileText className="h-4 w-4" />;
    case 'Foto ubicación / croquis':
      return <MapPin className="h-4 w-4" />;
    case 'Foto AVC04':
      return <Camera className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

// Mapeo de colores por tipo de documento
const getColorByTipo = (tipo: TipoDocumento) => {
  switch (tipo) {
    case 'Foto de perfil':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Memorandum destino':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Foto ubicación / croquis':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Foto AVC04':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const documentoColumns: ColumnDef<Documento>[] = [
  {
    accessorKey: "tipo_documento",
    header: "Tipo de Documento",
    cell: ({ row }) => {
      const tipo = row.getValue("tipo_documento") as TipoDocumento;
      return (
        <div className="flex items-center space-x-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getColorByTipo(tipo)}`}>
            {getIconByTipo(tipo)}
          </div>
          <div>
            <div className="font-medium">{tipo}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "funcionario.nombre_completo",
    header: "Funcionario",
    cell: ({ row }) => {
      const funcionario = row.original.funcionario;
      return (
        <div className="font-medium">
          {funcionario.nombre_completo}
        </div>
      );
    },
  },
  {
    accessorKey: "aprobado",
    header: "Estado",
    cell: ({ row }) => {
      const aprobado = row.getValue("aprobado") as boolean;
      const deleted = row.original.deleted_at;
      
      if (deleted) {
        return (
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
            Eliminado
          </Badge>
        );
      }
      
      return (
        <Badge
          variant={aprobado ? "default" : "secondary"}
          className={aprobado 
            ? "bg-green-100 text-green-800 border-green-200" 
            : "bg-yellow-100 text-yellow-800 border-yellow-200"
          }
        >
          {aprobado ? "Aprobado" : "Pendiente"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "tiene_archivo",
    header: "Imagen",
    cell: ({ row }) => {
      const tieneArchivo = row.getValue("tiene_archivo") as boolean;
      const urlArchivo = row.original.url_archivo;
      
      return (
        <div className="flex items-center space-x-3">
          {tieneArchivo && urlArchivo ? (
            <>
              <div className="relative" key={`img-${row.original.id}`}>
                <img
                  key={urlArchivo}
                  src={urlArchivo}
                  alt="Preview"
                  className="h-10 w-10 rounded-md object-cover border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.image-fallback')) {
                      target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200 image-fallback';
                      fallback.innerHTML = '<svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg>';
                      parent.appendChild(fallback);
                    } else if (parent) {
                      target.style.display = 'none';
                    }
                  }}
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    const parent = target.parentElement;
                    // Limpiar fallback si la imagen carga correctamente
                    if (parent) {
                      const fallback = parent.querySelector('.image-fallback');
                      if (fallback) {
                        fallback.remove();
                      }
                      target.style.display = 'block';
                    }
                  }}
                />
              </div>
              <div className="flex flex-col">
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                  Disponible
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(urlArchivo, '_blank')}
                  className="h-6 text-xs p-1 mt-1"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2" key={`no-img-${row.original.id}`}>
              <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200">
                <ImageIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                Sin imagen
              </Badge>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha de Creación",
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at") as string;
      return (
        <div className="text-sm text-muted-foreground">
          {format(new Date(createdAt), "dd 'de' MMMM, yyyy", { locale: es })}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const documento = row.original;
      const isDeleted = !!documento.deleted_at;
      
      const {
        openViewDialog,
        openEditDialog,
        openDeleteDialog,
      } = useDocumentoStore();
      
      const deleteDocumento = useDeleteDocumento();
      const restoreDocumento = useRestoreDocumento();
      
      const handleDelete = () => {
        deleteDocumento.mutate(documento.id, {
          onSuccess: () => {
            toast.success("Documento eliminado correctamente");
          },
          onError: (error) => {
            toast.error(error.message || "Error al eliminar documento");
          },
        });
      };
      
      const handleRestore = () => {
        restoreDocumento.mutate(documento.id, {
          onSuccess: () => {
            toast.success("Documento restaurado correctamente");
          },
          onError: (error) => {
            toast.error(error.message || "Error al restaurar documento");
          },
        });
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
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => openViewDialog(documento)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
            
            {documento.url_archivo && (
              <DropdownMenuItem onClick={() => window.open(documento.url_archivo!, '_blank')}>
                <Download className="mr-2 h-4 w-4" />
                Descargar archivo
              </DropdownMenuItem>
            )}
            
            {!isDeleted && (
              <>
                <DropdownMenuItem onClick={() => openEditDialog(documento)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                  disabled={deleteDocumento.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteDocumento.isPending ? "Eliminando..." : "Eliminar"}
                </DropdownMenuItem>
              </>
            )}
            
            {isDeleted && (
              <DropdownMenuItem
                onClick={handleRestore}
                disabled={restoreDocumento.isPending}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {restoreDocumento.isPending ? "Restaurando..." : "Restaurar"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];