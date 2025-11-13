"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, ChevronsUpDown } from "lucide-react";

import { useUpdateComision, useFuncionariosParaComision } from "@/hooks/comision.queries";
import { useComisionStore } from "@/store/comision.store";
import { Comision, ComisionUpdateData } from "@/types/comision.types";

// Schema
const comisionSchema = z.object({
  descripcion: z.string().optional(),
  fecha_inicio: z.date(),
  fecha_fin: z.date(),
  funcionario_id: z.number().min(1),
  activo: z.boolean(),
  pdf_respaldo: z.instanceof(File).optional(),
});

type ComisionFormData = z.infer<typeof comisionSchema>;

export function ComisionEditDialog() {
  const { isEditDialogOpen, selectedComision, closeEditDialog } = useComisionStore();
  const update = useUpdateComision();
  const { data: funcionarios = [] } = useFuncionariosParaComision();

  const [openCalendarStart, setOpenCalendarStart] = useState(false);
  const [openCalendarEnd, setOpenCalendarEnd] = useState(false);
  const [openFuncionario, setOpenFuncionario] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ComisionFormData>({
    resolver: zodResolver(comisionSchema),
    defaultValues: {
      descripcion: "",
      fecha_inicio: new Date(),
      fecha_fin: new Date(),
      funcionario_id: 0,
      activo: true,
      pdf_respaldo: undefined,
    },
  });

  useEffect(() => {
    if (selectedComision && isEditDialogOpen) {
      form.reset({
        descripcion: selectedComision.descripcion || "",
        fecha_inicio: new Date(selectedComision.fecha_inicio),
        fecha_fin: new Date(selectedComision.fecha_fin),
        funcionario_id: selectedComision.funcionario_id,
        activo: selectedComision.activo,
      });
    }
  }, [selectedComision, isEditDialogOpen, form]);

  const onSubmit = (data: ComisionFormData) => {
    if (!selectedComision) return;
    const payload: ComisionUpdateData = {
      descripcion: data.descripcion,
      fecha_inicio: data.fecha_inicio.toISOString().split("T")[0],
      fecha_fin: data.fecha_fin.toISOString().split("T")[0],
      funcionario_id: data.funcionario_id,
      activo: data.activo,
    };

    if (selectedFile) {
      payload.pdf_respaldo = selectedFile;
    }

    update.mutate(
      { id: selectedComision.id, data: payload },
      {
        onSuccess: () => {
          closeEditDialog();
          setSelectedFile(null);
        }
      }
    );
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
      form.setValue('pdf_respaldo', file);
    }
  };

  if (!selectedComision) return null;

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Comisión</DialogTitle>
          <DialogDescription>Modificar detalles de la comisión</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Fecha Inicio *</Label>
              <Popover open={openCalendarStart} onOpenChange={setOpenCalendarStart}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    {form.watch("fecha_inicio")
                      ? format(form.watch("fecha_inicio"), "dd/MM/yyyy", { locale: es })
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={form.watch("fecha_inicio")}
                    onSelect={(date) => date && form.setValue("fecha_inicio", date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Fecha Fin *</Label>
              <Popover open={openCalendarEnd} onOpenChange={setOpenCalendarEnd}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    {form.watch("fecha_fin")
                      ? format(form.watch("fecha_fin"), "dd/MM/yyyy", { locale: es })
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={form.watch("fecha_fin")}
                    onSelect={(date) => date && form.setValue("fecha_fin", date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Funcionario *</Label>
              <Popover open={openFuncionario} onOpenChange={setOpenFuncionario}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openFuncionario}
                    className="w-full justify-between"
                  >
                    {funcionarios.find(f => f.id === form.watch("funcionario_id"))?.nombre_completo || "Seleccionar funcionario..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar funcionario..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron funcionarios.</CommandEmpty>
                      <CommandGroup>
                        {funcionarios.map((funcionario) => (
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
                                form.watch("funcionario_id") === funcionario.id
                                  ? "opacity-100"
                                  : "opacity-0"
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
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <textarea
                className="w-full border px-3 py-2 rounded"
                rows={3}
                {...form.register("descripcion")}
              />
            </div>
            <div className="space-y-2">
              <Label>PDF de Respaldo</Label>
              {selectedComision?.pdf_respaldo_url && !selectedFile && (
                <div className="p-2 bg-gray-50 rounded flex items-center justify-between">
                  <span className="text-sm">Archivo actual: comision_{selectedComision.id}.pdf</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/api/auth/comisiones/${selectedComision.id}/pdf`, '_blank')}
                  >
                    Ver PDF
                  </Button>
                </div>
              )}
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full border px-3 py-2 rounded"
              />
              {selectedFile && (
                <p className="text-sm text-green-600">
                  Nuevo archivo seleccionado: {selectedFile.name}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Solo archivos PDF, máximo 10MB. Dejar vacío para mantener el archivo actual.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" {...form.register("activo")} />
              <Label>Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeEditDialog}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}