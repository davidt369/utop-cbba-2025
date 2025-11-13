"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Check, ChevronsUpDown, Save, X, Download } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { useSancionesStore } from "@/store/sanciones.store";
import { useUpdateSancion, useFuncionarios, useTiposSancion } from "@/hooks/sanciones.queries";
import { SancionUpdateData, TipoSancion, TIPOS_SANCION } from "@/types/sancion.types";
import { PDFLink } from "@/components/sanciones/pdf-viewer";

// Schema de validación
const sancionSchema = z.object({
  funcionario_id: z.number().min(1, "Debe seleccionar un funcionario"),
  tipo_sancion: z.enum(["Suspencion", "Baja Definitiva"], {
    message: "Debe seleccionar un tipo de sanción",
  }),
  descripcion: z.string().optional(),
  fecha_inicio: z.date({
    message: "La fecha de inicio es requerida",
  }),
  fecha_fin: z.date().optional(),
  activa: z.boolean(),
  pdf_respaldo: z.instanceof(File).optional(),
}).refine((data) => {
  if (data.fecha_fin && data.fecha_inicio) {
    return data.fecha_fin >= data.fecha_inicio;
  }
  return true;
}, {
  message: "La fecha de fin debe ser posterior o igual a la fecha de inicio",
  path: ["fecha_fin"],
}).refine((data) => {
  if (data.pdf_respaldo) {
    const isValidType = data.pdf_respaldo.type === 'application/pdf' || data.pdf_respaldo.name.toLowerCase().endsWith('.pdf');
    const isValidSize = data.pdf_respaldo.size <= 10 * 1024 * 1024; // 10MB

    console.log('🔧 Schema validation:', {
      fileName: data.pdf_respaldo.name,
      fileType: data.pdf_respaldo.type,
      fileSize: data.pdf_respaldo.size,
      isValidType,
      isValidSize
    });

    return isValidType && isValidSize;
  }
  return true;
}, {
  message: 'El archivo debe ser un PDF y no exceder 10MB',
  path: ['pdf_respaldo'],
});

type SancionFormData = z.infer<typeof sancionSchema>;

export function SancionEditDialog() {
  const { isEditDialogOpen, selectedSancion, closeEditDialog, updateSelectedSancion } = useSancionesStore();
  const updateSancionMutation = useUpdateSancion();
  const { data: funcionarios, isLoading: isLoadingFuncionarios } = useFuncionarios();
  const { data: tiposSancion, isLoading: isLoadingTipos } = useTiposSancion();

  const [openFuncionario, setOpenFuncionario] = useState(false);
  const [openFechaInicio, setOpenFechaInicio] = useState(false);
  const [openFechaFin, setOpenFechaFin] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<SancionFormData>({
    resolver: zodResolver(sancionSchema),
    defaultValues: {
      funcionario_id: 0,
      tipo_sancion: "Suspencion",
      descripcion: "",
      fecha_inicio: new Date(),
      fecha_fin: undefined,
      activa: true,
      pdf_respaldo: undefined,
    },
  });

  // Observar el tipo de sanción para manejar Baja Definitiva
  const tipoSancion = form.watch("tipo_sancion");

  // Auto-set fecha_fin para Baja Definitiva
  useEffect(() => {
    if (tipoSancion === "Baja Definitiva") {
      const fechaInicio = form.watch("fecha_inicio");
      if (fechaInicio) {
        form.setValue("fecha_fin", fechaInicio);
      }
    }
  }, [tipoSancion, form]);

  // Auto-update fecha_fin cuando cambia fecha_inicio en Baja Definitiva
  useEffect(() => {
    const fechaInicio = form.watch("fecha_inicio");
    if (tipoSancion === "Baja Definitiva" && fechaInicio) {
      form.setValue("fecha_fin", fechaInicio);
    }
  }, [form.watch("fecha_inicio"), tipoSancion, form]);

  // Poblar formulario cuando se selecciona una sanción
  useEffect(() => {
    if (selectedSancion && isEditDialogOpen) {
      // Función para parsear fecha más robusta
      const parseDate = (dateString: string | Date | undefined): Date => {
        if (!dateString) return new Date();

        // Intentar diferentes formatos
        let date: Date;

        // Si ya es un objeto Date
        if (dateString instanceof Date) {
          return dateString;
        }

        // Si contiene tiempo (formato ISO)
        if (typeof dateString === 'string' && dateString.includes('T')) {
          date = new Date(dateString);
        }
        // Si es formato YYYY-MM-DD
        else if (typeof dateString === 'string' && dateString.includes('-')) {
          const [year, month, day] = dateString.split('-').map(Number);
          date = new Date(year, month - 1, day);
        }
        // Último recurso
        else {
          date = new Date(dateString);
        }

        return isNaN(date.getTime()) ? new Date() : date;
      };

      const formData = {
        funcionario_id: selectedSancion.funcionario.id,
        tipo_sancion: selectedSancion.tipo_sancion,
        descripcion: selectedSancion.descripcion || "",
        fecha_inicio: parseDate(selectedSancion.fecha_inicio),
        fecha_fin: selectedSancion.fecha_fin ? parseDate(selectedSancion.fecha_fin) : undefined,
        activa: selectedSancion.activa,
      };

      form.reset(formData);
      setOpenFuncionario(false);
      setOpenFechaInicio(false);
      setOpenFechaFin(false);
      setSelectedFile(null);
    }
  }, [selectedSancion, isEditDialogOpen, form]);

  const onSubmit = async (data: SancionFormData) => {
    if (!selectedSancion) return;

    console.log('🔧 Frontend: OnSubmit ejecutado con datos:', {
      ...data,
      pdf_respaldo: data.pdf_respaldo ? {
        name: data.pdf_respaldo.name,
        size: data.pdf_respaldo.size,
        type: data.pdf_respaldo.type
      } : null
    });

    // Función simple para formatear fecha sin problemas de zona horaria
    const formatDateSimple = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Usar selectedFile en lugar de data.pdf_respaldo para más confiabilidad
    const fileToUpload = selectedFile || data.pdf_respaldo;

    console.log('🔧 Frontend: Datos procesados para envío:', {
      funcionario_id: data.funcionario_id,
      tipo_sancion: data.tipo_sancion,
      fecha_inicio: formatDateSimple(data.fecha_inicio),
      fecha_fin: data.fecha_fin ? formatDateSimple(data.fecha_fin) : undefined,
      descripcion: data.descripcion || undefined,
      activa: data.activa,
      fileToUpload: fileToUpload ? {
        name: fileToUpload.name,
        size: fileToUpload.size,
        type: fileToUpload.type
      } : null
    });

    // Si no hay archivo PDF, enviar como JSON regular
    if (!fileToUpload) {
      console.log('🔧 Frontend: No hay archivo PDF, enviando como JSON');
      const updateData: SancionUpdateData = {
        funcionario_id: data.funcionario_id,
        tipo_sancion: data.tipo_sancion,
        descripcion: data.descripcion || undefined,
        fecha_inicio: formatDateSimple(data.fecha_inicio),
        fecha_fin: data.fecha_fin ? formatDateSimple(data.fecha_fin) : undefined,
        activa: data.activa,
      };

      updateSancionMutation.mutate(
        { id: selectedSancion.id, data: updateData },
        {
          onSuccess: (updatedSancion) => {
            updateSelectedSancion(updatedSancion);
            handleClose();
          },
        }
      );
      return;
    }

    console.log('🔧 Frontend: SÍ hay archivo PDF, enviando como FormData');

    // Si hay archivo PDF, enviar como FormData
    const formData = new FormData();

    // Agregar campos obligatorios
    formData.append('funcionario_id', String(data.funcionario_id));
    formData.append('tipo_sancion', data.tipo_sancion);
    formData.append('fecha_inicio', formatDateSimple(data.fecha_inicio));
    formData.append('activa', data.activa ? 'true' : 'false'); // Asegurar que sea string 'true' o 'false'

    // Agregar campos opcionales
    if (data.descripcion) formData.append('descripcion', data.descripcion);
    if (data.fecha_fin) formData.append('fecha_fin', formatDateSimple(data.fecha_fin));
    if (fileToUpload) {
      formData.append('pdf_respaldo', fileToUpload);
      console.log('🔧 Frontend: Agregando archivo PDF al FormData:', {
        fileName: fileToUpload.name,
        fileSize: fileToUpload.size,
        fileType: fileToUpload.type
      });
    }

    // Forzar método PUT vía _method para que Laravel procese archivos cuando el cliente use POST
    formData.append('_method', 'PUT');

    console.log('🔧 Frontend: FormData construido para sanción ID:', selectedSancion.id);
    console.log('🔧 Frontend: Datos del FormData:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    updateSancionMutation.mutate(
      { id: selectedSancion.id, data: formData },
      {
        onSuccess: (updatedSancion) => {
          updateSelectedSancion(updatedSancion);
          handleClose();
        },
      }
    );
  };



  const handleClose = () => {
    closeEditDialog();
    form.reset();
    setOpenFuncionario(false);
    setOpenFechaInicio(false);
    setOpenFechaFin(false);
    setSelectedFile(null);
  };

  if (!selectedSancion) return null;

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Editar Sanción
          </DialogTitle>
          <DialogDescription>
            Editando sanción de: <span className="font-semibold">
              {selectedSancion.funcionario.nombre_completo}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4">
            {/* Seleccionar funcionario */}
            <div className="space-y-2">
              <Label htmlFor="funcionario_id">Funcionario *</Label>
              <Popover open={openFuncionario} onOpenChange={setOpenFuncionario}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openFuncionario}
                    className="w-full justify-between"
                  >
                    {form.watch("funcionario_id")
                      ? (funcionarios?.find((funcionario) => funcionario.id === form.watch("funcionario_id"))?.nombre_completo || selectedSancion.funcionario.nombre_completo)
                      : "Seleccionar funcionario..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar funcionario..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron funcionarios.</CommandEmpty>
                      <CommandGroup>
                        {funcionarios?.map((funcionario) => (
                          <CommandItem
                            key={funcionario.id}
                            value={funcionario.nombre_completo}
                            onSelect={() => {
                              form.setValue("funcionario_id", funcionario.id);
                              setOpenFuncionario(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                form.watch("funcionario_id") === funcionario.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {funcionario.nombre_completo}
                            {funcionario.id === selectedSancion.funcionario.id && (
                              <span className="ml-2 text-xs text-muted-foreground">(Actual)</span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {form.formState.errors.funcionario_id && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.funcionario_id.message}
                </p>
              )}
            </div>

            {/* Tipo de sanción */}
            <div className="space-y-2">
              <Label htmlFor="tipo_sancion">Tipo de Sanción *</Label>
              <Select
                value={form.watch("tipo_sancion")}
                onValueChange={(value) => form.setValue("tipo_sancion", value as TipoSancion)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_SANCION.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo === "Suspencion" ? "Suspensión" : tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.tipo_sancion && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.tipo_sancion.message}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción de la sanción..."
                {...form.register("descripcion")}
                rows={3}
              />
              {form.formState.errors.descripcion && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.descripcion.message}
                </p>
              )}
            </div>

            {/* Fecha de inicio */}
            <div className="space-y-2">
              <Label>Fecha de Inicio *</Label>
              <Popover open={openFechaInicio} onOpenChange={setOpenFechaInicio}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("fecha_inicio") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("fecha_inicio") && form.watch("fecha_inicio") instanceof Date && !isNaN(form.watch("fecha_inicio").getTime()) ? (
                      format(form.watch("fecha_inicio"), "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("fecha_inicio")}
                    onSelect={(date) => {
                      if (date) {
                        form.setValue("fecha_inicio", date);
                        setOpenFechaInicio(false);
                      }
                    }}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.fecha_inicio && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.fecha_inicio.message}
                </p>
              )}
            </div>

            {/* Fecha de fin */}
            <div className="space-y-2">
              <Label>
                Fecha de Fin
                {tipoSancion === "Baja Definitiva" && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (Automática para baja definitiva)
                  </span>
                )}
              </Label>
              <Popover
                open={openFechaFin}
                onOpenChange={(open) => {
                  // No permitir abrir el popover si es baja definitiva
                  if (tipoSancion !== "Baja Definitiva") {
                    setOpenFechaFin(open);
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={tipoSancion === "Baja Definitiva"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("fecha_fin") && "text-muted-foreground",
                      tipoSancion === "Baja Definitiva" && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("fecha_fin") && form.watch("fecha_fin") instanceof Date && !isNaN(form.watch("fecha_fin")!.getTime()) ? (
                      format(form.watch("fecha_fin")!, "PPP", { locale: es })
                    ) : tipoSancion === "Baja Definitiva" ? (
                      <span>Igual a fecha de inicio (permanente)</span>
                    ) : (
                      <span>Seleccionar fecha (opcional)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("fecha_fin")}
                    onSelect={(date) => {
                      if (tipoSancion !== "Baja Definitiva") {
                        form.setValue("fecha_fin", date);
                        setOpenFechaFin(false);
                      }
                    }}
                    disabled={(date) => {
                      const fechaInicio = form.watch("fecha_inicio");
                      return fechaInicio ? date < fechaInicio : date < new Date("1900-01-01");
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {tipoSancion === "Baja Definitiva" && (
                <p className="text-xs text-blue-600">
                  💡 Las bajas definitivas son permanentes y no tienen fecha de finalización
                </p>
              )}
              {form.formState.errors.fecha_fin && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.fecha_fin.message}
                </p>
              )}
            </div>
          </div>

          {/* PDF de Respaldo */}
          <div className="space-y-2">
            <Label htmlFor="pdf_respaldo">PDF de Respaldo (Opcional)</Label>
            {selectedSancion?.pdf_respaldo_ruta && selectedSancion.id && (
              <div className="flex items-center justify-between bg-blue-50 p-2 rounded-md mb-2">
                <div className="text-xs text-blue-600">
                  📎 Archivo actual:
                </div>
                <PDFLink
                  sancionId={selectedSancion.id}
                  pdfFileName={selectedSancion.pdf_respaldo_ruta.split('/').pop() || 'documento.pdf'}
                  className="text-blue-600 border-blue-200 hover:bg-blue-100 text-xs p-1 h-auto"
                />
              </div>
            )}

            {/* Debug info - remover después
            {process.env.NODE_ENV === 'development' && selectedSancion && (
              <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded mb-2">
                Debug: ID={selectedSancion.id}, PDF={selectedSancion.pdf_respaldo_ruta},
                UpdatedAt={selectedSancion.updated_at}
              </div>
            )} */}
            <Input
              id="pdf_respaldo"
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                console.log('🔧 Frontend: Archivo seleccionado:', {
                  fileName: file?.name,
                  fileSize: file?.size,
                  fileType: file?.type,
                  file: file
                });

                // Actualizar tanto el estado manual como el form
                setSelectedFile(file || null);
                form.setValue("pdf_respaldo", file, { shouldValidate: true });
                form.trigger("pdf_respaldo");
              }}
              className="cursor-pointer"
            />
            {selectedFile && (
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded mt-2">
                ✅ Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {selectedSancion?.pdf_respaldo_ruta
                ? "Sube un nuevo archivo PDF para reemplazar el actual (máximo 10MB)"
                : "Sube un archivo PDF como respaldo de la sanción (máximo 10MB)"
              }
            </div>
            {form.formState.errors.pdf_respaldo && (
              <p className="text-sm text-red-500">
                {form.formState.errors.pdf_respaldo.message}
              </p>
            )}
          </div>

          {updateSancionMutation.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {updateSancionMutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateSancionMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateSancionMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateSancionMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}