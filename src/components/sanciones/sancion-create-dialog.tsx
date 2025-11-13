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
import { CalendarIcon, Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { useSancionesStore } from "@/store/sanciones.store";
import { useCreateSancion, useFuncionariosDisponibles, useTiposSancion } from "@/hooks/sanciones.queries";
import { SancionCreateData, TipoSancion, TIPOS_SANCION } from "@/types/sancion.types";

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
    return data.pdf_respaldo.type === 'application/pdf' && data.pdf_respaldo.size <= 10 * 1024 * 1024; // 10MB
  }
  return true;
}, {
  message: 'El archivo debe ser un PDF y no exceder 10MB',
  path: ['pdf_respaldo'],
});

type SancionFormData = z.infer<typeof sancionSchema>;

export function SancionCreateDialog() {
  const { isCreateDialogOpen, closeCreateDialog } = useSancionesStore();
  const createSancionMutation = useCreateSancion();
  const { data: funcionarios, isLoading: isLoadingFuncionarios } = useFuncionariosDisponibles();
  const { data: tiposSancion, isLoading: isLoadingTipos } = useTiposSancion();

  const [openFuncionario, setOpenFuncionario] = useState(false);
  const [openFechaInicio, setOpenFechaInicio] = useState(false);
  const [openFechaFin, setOpenFechaFin] = useState(false);

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

  // Observar cambios en el tipo de sanción
  const tipoSancion = form.watch("tipo_sancion");
  const fechaInicio = form.watch("fecha_inicio");

  // Efecto para manejar cambios en tipo de sanción
  useEffect(() => {
    if (tipoSancion === "Baja Definitiva") {
      // Para baja definitiva, la fecha fin es igual a la fecha inicio (permanente)
      form.setValue("fecha_fin", fechaInicio);
    } else if (tipoSancion === "Suspencion") {
      // Para suspensión, limpiar fecha fin para que sea opcional
      form.setValue("fecha_fin", undefined);
    }
  }, [tipoSancion, fechaInicio, form]);

  // Efecto para actualizar fecha fin cuando cambia fecha inicio en baja definitiva
  useEffect(() => {
    if (tipoSancion === "Baja Definitiva" && fechaInicio) {
      form.setValue("fecha_fin", fechaInicio);
    }
  }, [fechaInicio, tipoSancion, form]);

  const onSubmit = async (data: SancionFormData) => {
    // Función simple para formatear fecha sin problemas de zona horaria
    const formatDateSimple = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Si no hay archivo PDF, enviar como JSON regular
    if (!data.pdf_respaldo) {
      const submitData: SancionCreateData = {
        funcionario_id: data.funcionario_id,
        tipo_sancion: data.tipo_sancion,
        descripcion: data.descripcion || undefined,
        fecha_inicio: formatDateSimple(data.fecha_inicio),
        fecha_fin: data.fecha_fin ? formatDateSimple(data.fecha_fin) : undefined,
        activa: data.activa,
      };

      createSancionMutation.mutate(submitData, {
        onSuccess: () => {
          handleClose();
        },
      });
      return;
    }

    // Si hay archivo PDF, enviar como FormData
    const formData = new FormData();

    // Agregar campos obligatorios
    formData.append('funcionario_id', String(data.funcionario_id));
    formData.append('tipo_sancion', data.tipo_sancion);
    formData.append('fecha_inicio', formatDateSimple(data.fecha_inicio));
    formData.append('activa', data.activa.toString());

    // Agregar campos opcionales
    if (data.descripcion) formData.append('descripcion', data.descripcion);
    if (data.fecha_fin) formData.append('fecha_fin', formatDateSimple(data.fecha_fin));
    if (data.pdf_respaldo) formData.append('pdf_respaldo', data.pdf_respaldo);

    createSancionMutation.mutate(formData as unknown as SancionCreateData, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  const handleClose = () => {
    closeCreateDialog();
    form.reset();
    setOpenFuncionario(false);
    setOpenFechaInicio(false);
    setOpenFechaFin(false);
  };

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={handleClose}>
      <DialogContent
        className="w-full max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent"
        style={{ overscrollBehavior: 'contain' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nueva Sanción
          </DialogTitle>
          <DialogDescription>
            Registre una nueva sanción para un funcionario. Todos los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 grid-cols-1">
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
                      ? funcionarios?.find((funcionario) => funcionario.id === form.watch("funcionario_id"))?.nombre_completo
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
                    {form.watch("fecha_inicio") ? (
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
                    {form.watch("fecha_fin") ? (
                      format(form.watch("fecha_fin") as Date, "PPP", { locale: es })
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
            <Input
              id="pdf_respaldo"
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                form.setValue("pdf_respaldo", file);
              }}
              className="cursor-pointer"
            />
            <div className="text-xs text-muted-foreground">
              Sube un archivo PDF como respaldo de la sanción (máximo 10MB)
            </div>
            {form.formState.errors.pdf_respaldo && (
              <p className="text-sm text-red-500">
                {form.formState.errors.pdf_respaldo.message}
              </p>
            )}
          </div>

          {createSancionMutation.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {createSancionMutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createSancionMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createSancionMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              {createSancionMutation.isPending ? "Creando..." : "Crear Sanción"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}