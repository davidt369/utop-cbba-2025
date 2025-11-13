"use client";

import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, ChevronsUpDown } from "lucide-react";

import { useCreateComision, useFuncionariosParaComision } from "@/hooks/comision.queries";
import { useComisionStore } from "@/store/comision.store";

const comisionSchema = z.object({
  descripcion: z.string().optional(),
  fecha_inicio: z.date().refine((date) => date instanceof Date && !isNaN(date.getTime()), {
    message: "Fecha de inicio es requerida",
  }),
  fecha_fin: z.date().refine((date) => date instanceof Date && !isNaN(date.getTime()), {
    message: "Fecha fin es requerida",
  }),
  funcionario_id: z.number().min(1, "Debe seleccionar un funcionario"),
  pdf_respaldo: z.instanceof(File).optional(),
  // activo removido - ahora se calcula automáticamente
}).refine((data) => {
  if (!data.fecha_inicio || !data.fecha_fin) return true;
  return data.fecha_fin >= data.fecha_inicio;
}, {
  message: "La fecha fin no puede ser menor a la fecha inicio",
  path: ["fecha_fin"],
});

type ComisionFormData = z.infer<typeof comisionSchema>;

export function ComisionCreateDialog() {
  const { isCreateDialogOpen, closeCreateDialog } = useComisionStore();
  const createMutation = useCreateComision();
  const { data: funcionarios = [] } = useFuncionariosParaComision();
  const [openFuncionario, setOpenFuncionario] = useState(false);
  const [openFechaInicio, setOpenFechaInicio] = useState(false);
  const [openFechaFin, setOpenFechaFin] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ComisionFormData>({
    resolver: zodResolver(comisionSchema),
    defaultValues: {
      fecha_inicio: new Date(),
      fecha_fin: new Date(),
      funcionario_id: 0,
      descripcion: "",
      pdf_respaldo: undefined,
    },
  });

  const onSubmit = (data: ComisionFormData) => {
    const payload: any = {
      descripcion: data.descripcion,
      fecha_inicio: data.fecha_inicio.toISOString().split('T')[0],
      fecha_fin: data.fecha_fin.toISOString().split('T')[0],
      funcionario_id: data.funcionario_id,
    };

    if (selectedFile) {
      payload.pdf_respaldo = selectedFile;
    }

    createMutation.mutate(
      payload,
      {
        onSuccess: () => {
          closeCreateComisionDialog();
        },
      }
    );
  };

  const closeCreateComisionDialog = () => {
    closeCreateDialog();
    form.reset();
    setOpenFuncionario(false);
    setOpenFechaInicio(false);
    setOpenFechaFin(false);
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
      form.setValue('pdf_respaldo', file);
    }
  };

  const selectedFuncionario = funcionarios.find(f => f.id === form.watch("funcionario_id"));

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={closeCreateComisionDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Comisión</DialogTitle>
          <DialogDescription>Crear nueva comisión</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
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
                    {selectedFuncionario
                      ? selectedFuncionario.nombre_completo
                      : "Seleccionar funcionario..."}
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
              {form.formState.errors.funcionario_id && (
                <p className="text-sm text-red-500">{form.formState.errors.funcionario_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Fecha Inicio *</Label>
              <Popover open={openFechaInicio} onOpenChange={setOpenFechaInicio}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    {form.watch("fecha_inicio") ? format(form.watch("fecha_inicio"), 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={form.watch("fecha_inicio")}
                    onSelect={(date) => {
                      if (date) {
                        form.setValue("fecha_inicio", date);
                        setOpenFechaInicio(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.fecha_inicio && <p className="text-sm text-red-500">{form.formState.errors.fecha_inicio.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Fecha Fin *</Label>
              <Popover open={openFechaFin} onOpenChange={setOpenFechaFin}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    {form.watch("fecha_fin") ? format(form.watch("fecha_fin"), 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={form.watch("fecha_fin")}
                    onSelect={(date) => {
                      if (date) {
                        form.setValue("fecha_fin", date);
                        setOpenFechaFin(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.fecha_fin && <p className="text-sm text-red-500">{form.formState.errors.fecha_fin.message}</p>}
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
              <Label>PDF de Respaldo (Opcional)</Label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full border px-3 py-2 rounded"
              />
              {selectedFile && (
                <p className="text-sm text-green-600">
                  Archivo seleccionado: {selectedFile.name}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Solo archivos PDF, máximo 10MB
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={closeCreateComisionDialog} variant="ghost">Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}