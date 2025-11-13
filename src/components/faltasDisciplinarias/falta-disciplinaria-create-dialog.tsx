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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { useFaltaDisciplinariaStore } from "@/store/falta-disciplinaria.store";
import { useCreateFaltaDisciplinaria, useFuncionarios, useTiposGravedad } from "@/hooks/falta-disciplinaria.queries";
import { FaltaDisciplinariaCreateData, TipoGravedad, TIPOS_GRAVEDAD } from "@/types/falta-disciplinaria.types";

// Schema de validación
const faltaDisciplinariaSchema = z.object({
  funcionario_id: z.number().min(1, "Debe seleccionar un funcionario"),
  tipo_gravedad: z.enum(["Leve", "Grave", "Muy Grave"], {
    message: "Debe seleccionar un tipo de gravedad",
  }),
  descripcion: z.string().min(1, "La descripción es requerida").max(500, "La descripción no puede exceder 500 caracteres"),
  fecha_falta: z.string().nonempty("La fecha y hora de la falta es requerida"),
});

// Helper to format Date to 'YYYY-MM-DDTHH:mm' in local time
const formatLocalDateTime = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

type FaltaDisciplinariaFormData = z.infer<typeof faltaDisciplinariaSchema>;

export function FaltaDisciplinariaCreateDialog() {
  const { isCreateDialogOpen, closeCreateDialog } = useFaltaDisciplinariaStore();
  const createFaltaMutation = useCreateFaltaDisciplinaria();
  const { data: funcionarios, isLoading: isLoadingFuncionarios } = useFuncionarios();
  const { data: tiposGravedad, isLoading: isLoadingTipos } = useTiposGravedad();

  const [openFuncionario, setOpenFuncionario] = useState(false);
  const [openFechaFalta, setOpenFechaFalta] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FaltaDisciplinariaFormData>({
    resolver: zodResolver(faltaDisciplinariaSchema),
    defaultValues: {
      funcionario_id: 0,
      tipo_gravedad: "Leve",
      descripcion: "",
      fecha_falta: formatLocalDateTime(new Date()),
    },
  });

  const onSubmit = (data: FaltaDisciplinariaFormData) => {
    // Función simple para formatear fecha sin problemas de zona horaria
    const formatDateSimple = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formData = new FormData();
    formData.append('funcionario_id', String(data.funcionario_id));
    formData.append('tipo_gravedad', data.tipo_gravedad);
    formData.append('descripcion', data.descripcion);
    formData.append('fecha_falta', data.fecha_falta.replace('T', ' ') + ':00');
    if (selectedFile) {
      formData.append('pdf_respaldo', selectedFile);
    }

    createFaltaMutation.mutate(formData, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  const handleClose = () => {
    closeCreateDialog();
    form.reset();
    setOpenFuncionario(false);
    setOpenFechaFalta(false);
    setSelectedFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('El archivo no puede superar los 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nueva Falta Disciplinaria
          </DialogTitle>
          <DialogDescription>
            Registre una nueva falta disciplinaria para un funcionario. Todos los campos marcados con * son obligatorios.
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

            {/* Tipo de gravedad */}
            <div className="space-y-2">
              <Label htmlFor="tipo_gravedad">Tipo de Gravedad *</Label>
              <Select
                value={form.watch("tipo_gravedad")}
                onValueChange={(value) => form.setValue("tipo_gravedad", value as TipoGravedad)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_GRAVEDAD.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.tipo_gravedad && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.tipo_gravedad.message}
                </p>
              )}
            </div>

            {/* Fecha de la falta */}
            <div className="space-y-2">
              <Label htmlFor="fecha_falta">Fecha y Hora de la Falta *</Label>
              <input
                id="fecha_falta"
                type="datetime-local"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register("fecha_falta")}
              />
              {form.formState.errors.fecha_falta && (
                <p className="text-sm text-red-500">{form.formState.errors.fecha_falta.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción detallada de la falta disciplinaria..."
                {...form.register("descripcion")}
                rows={4}
              />
              {form.formState.errors.descripcion && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.descripcion.message}
                </p>
              )}
            </div>

            {/* PDF Respaldo opcional */}
            <div className="space-y-2">
              <Label>Adjuntar PDF de Respaldo (Opcional)</Label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full border px-3 py-2 rounded"
              />
              {selectedFile && (
                <div>
                  <p className="text-sm text-green-600">Archivo seleccionado: {selectedFile.name}</p>
                  <iframe src={URL.createObjectURL(selectedFile)} className="w-full h-64 border mt-2" />
                </div>
              )}
              <p className="text-xs text-gray-500">Solo archivos PDF, máximo 10MB</p>
            </div>
          </div>

          {createFaltaMutation.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {createFaltaMutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createFaltaMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createFaltaMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              {createFaltaMutation.isPending ? "Creando..." : "Crear Falta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}