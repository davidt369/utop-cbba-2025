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
// Helper to format Date to 'YYYY-MM-DDTHH:mm' in local time
const formatLocalDateTime = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
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
import { CalendarIcon, Check, ChevronsUpDown, Save, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { useFaltaDisciplinariaStore } from "@/store/falta-disciplinaria.store";
import { getToken } from '@/store/auth.store';
import { useUpdateFaltaDisciplinaria, useFuncionarios, useTiposGravedad } from "@/hooks/falta-disciplinaria.queries";
import { FaltaDisciplinariaUpdateData, TipoGravedad, TIPOS_GRAVEDAD } from "@/types/falta-disciplinaria.types";

// Schema de validación
const faltaDisciplinariaSchema = z.object({
  funcionario_id: z.number().min(1, "Debe seleccionar un funcionario"),
  tipo_gravedad: z.enum(["Leve", "Grave", "Muy Grave"], {
    message: "Debe seleccionar un tipo de gravedad",
  }),
  descripcion: z.string().min(1, "La descripción es requerida").max(500, "La descripción no puede exceder 500 caracteres"),
  fecha_falta: z.string().nonempty("La fecha y hora de la falta es requerida"),
});

type FaltaDisciplinariaFormData = z.infer<typeof faltaDisciplinariaSchema>;

export function FaltaDisciplinariaEditDialog() {
  const { isEditDialogOpen, selectedFalta, closeEditDialog } = useFaltaDisciplinariaStore();
  const updateFaltaMutation = useUpdateFaltaDisciplinaria();
  const { data: funcionarios, isLoading: isLoadingFuncionarios } = useFuncionarios();
  const { data: tiposGravedad, isLoading: isLoadingTipos } = useTiposGravedad();

  const [openFuncionario, setOpenFuncionario] = useState(false);
  const [openFechaFalta, setOpenFechaFalta] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deletePdf, setDeletePdf] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const form = useForm<FaltaDisciplinariaFormData>({
    resolver: zodResolver(faltaDisciplinariaSchema),
    defaultValues: {
      funcionario_id: 0,
      tipo_gravedad: "Leve",
      descripcion: "",
      fecha_falta: new Date().toISOString().slice(0, 16),
    },
  });

  // Poblar formulario cuando se selecciona una falta
  useEffect(() => {
    if (selectedFalta && isEditDialogOpen) {
      // Función para parsear fecha más robusta
      const parseDate = (dateString: string | Date | undefined): Date => {
        if (!dateString) return new Date();

        // Si ya es un objeto Date
        if (dateString instanceof Date) {
          return dateString;
        }

        // Si es un string ISO con tiempo (YYYY-MM-DDTHH:mm:ssZ), o datetime-local (YYYY-MM-DDTHH:mm)
        if (typeof dateString === 'string' && dateString.includes('T')) {
          return new Date(dateString);
        }
        // Si es formato solo fecha YYYY-MM-DD
        if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          const [year, month, day] = dateString.split('-').map(Number);
          return new Date(year, month - 1, day);
        }

        return new Date(dateString);
      };

      form.reset({
        funcionario_id: selectedFalta.funcionario.id,
        tipo_gravedad: selectedFalta.tipo_gravedad,
        descripcion: selectedFalta.descripcion,
        fecha_falta: formatLocalDateTime(parseDate(selectedFalta.fecha_falta)),
      });
      setOpenFuncionario(false);
      setOpenFechaFalta(false);
      setSelectedFile(null);
      // Reset any previously created blob URL
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
    }
  }, [selectedFalta, isEditDialogOpen, form]);

  // Fetch protected PDF and create blob URL for iframe preview
  useEffect(() => {
    let mounted = true;
    // Only fetch when there's an existing remote pdf and no new selectedFile
    if (!selectedFalta || selectedFile || !selectedFalta.pdf_respaldo_url) return;

    const fetchPdf = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await fetch(`/api/auth/faltas-disciplinarias/${selectedFalta.id}/pdf`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/pdf',
          },
        });

        if (!res.ok) {
          console.error('Error fetching PDF', res.status);
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (mounted) setPdfBlobUrl(url);
      } catch (err) {
        console.error('Error fetching PDF', err);
      }
    };

    fetchPdf();

    return () => {
      mounted = false;
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
    };
  }, [selectedFalta, selectedFile]);

  const onSubmit = (data: FaltaDisciplinariaFormData) => {
    if (!selectedFalta) return;

    // Función para formatear fecha y hora en ISO
    const formatDateTime = (date: Date): string => date.toISOString();

    // Si hay archivo, usar FormData
    if (selectedFile) {
      const formData = new FormData();
      formData.append('funcionario_id', String(data.funcionario_id));
      formData.append('tipo_gravedad', data.tipo_gravedad);
      formData.append('descripcion', data.descripcion);
      formData.append('fecha_falta', data.fecha_falta.replace('T', ' ') + ':00');
      formData.append('pdf_respaldo', selectedFile);
      if (deletePdf) {
        formData.append('delete_pdf', '1');
      }

      updateFaltaMutation.mutate(
        { id: selectedFalta.id, data: formData },
        {
          onSuccess: () => handleClose(),
        }
      );
    } else {
      const updateData: FaltaDisciplinariaUpdateData = {
        funcionario_id: data.funcionario_id,
        tipo_gravedad: data.tipo_gravedad,
        descripcion: data.descripcion,
        fecha_falta: data.fecha_falta.replace('T', ' ') + ':00',
        ...(deletePdf ? { delete_pdf: 1 as 1 } : {}),
      };

      updateFaltaMutation.mutate(
        { id: selectedFalta.id, data: updateData },
        {
          onSuccess: () => handleClose(),
        }
      );
    }
  };

  const handleClose = () => {
    closeEditDialog();
    form.reset();
    setOpenFuncionario(false);
    setOpenFechaFalta(false);
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
      // If selecting a new file, cancel pending delete
      setDeletePdf(false);
    }
  };

  if (!selectedFalta) return null;

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Editar Falta Disciplinaria
          </DialogTitle>
          <DialogDescription>
            Editando falta de: <span className="font-semibold">
              {selectedFalta.funcionario.nombre_completo}
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
                      ? (funcionarios?.find((funcionario) => funcionario.id === form.watch("funcionario_id"))?.nombre_completo || selectedFalta.funcionario.nombre_completo)
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
                            {funcionario.id === selectedFalta.funcionario.id && (
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

            {/* Fecha y Hora de la falta */}
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

            {/* PDF respaldo */}
            <div className="space-y-2">
              <Label>PDF de Respaldo (Opcional)</Label>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="w-full border px-3 py-2 rounded" />
              <div className="flex items-start gap-2">
                {selectedFile ? (
                  <div>
                    <p className="text-sm text-green-600">Archivo nuevo: {selectedFile.name}</p>
                    <iframe src={URL.createObjectURL(selectedFile)} className="w-full h-64 border mt-2" />
                  </div>
                ) : selectedFalta && selectedFalta.pdf_respaldo_url ? (
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">PDF actual:</p>
                    {pdfBlobUrl ? (
                      <iframe src={pdfBlobUrl} className="w-full h-64 border mt-2" />
                    ) : (
                      <p className="text-sm text-muted-foreground">Cargando vista previa...</p>
                    )}
                  </div>
                ) : null}

                {/* Botón para eliminar PDF actual */}
                {selectedFalta && selectedFalta.pdf_respaldo_url && (
                  <div className="flex flex-col items-start gap-2">
                    <Button
                      variant={deletePdf ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => setDeletePdf((v) => !v)}
                    >
                      {deletePdf ? 'Marcado para eliminar' : 'Eliminar PDF'}
                    </Button>
                    {deletePdf && <p className="text-xs text-red-600">Se eliminará el PDF al guardar.</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {updateFaltaMutation.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {updateFaltaMutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateFaltaMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateFaltaMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateFaltaMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}