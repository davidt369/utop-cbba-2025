"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useSancionesStore } from "@/store/sanciones.store";
import { useCreateSancion, useFuncionariosDisponibles, useTiposSancion } from "@/hooks/sanciones.queries";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const schema = z.object({
    funcionario_ids: z.array(z.number().min(1)).min(1, "Debe seleccionar al menos un funcionario"),
    tipo_sancion: z.enum(["Suspencion", "Baja Definitiva"] as const),
    descripcion: z.string().optional(),
    fecha_inicio: z.date().optional(),
    fecha_fin: z.date().optional(),
    activa: z.boolean().optional(),
    pdf_respaldo: z.instanceof(File).optional(),
}).refine((data) => {
    const file = (data as any).pdf_respaldo as File | undefined;
    if (!file) return true;
    return file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024;
}, {
    message: 'El archivo debe ser un PDF y no exceder 10MB',
    path: ['pdf_respaldo'],
});

type FormDataSchema = z.infer<typeof schema>;

export default function SancionBulkCreateDialog() {
    const { isBulkCreateDialogOpen, closeBulkCreateDialog } = useSancionesStore();
    const { data: funcionarios, isLoading: loadingFuncionarios } = useFuncionariosDisponibles();
    const { data: tipos, isLoading: loadingTipos } = useTiposSancion();
    const createMutation = useCreateSancion();

    const [openFuncionario, setOpenFuncionario] = useState(false);
    const [openFechaInicio, setOpenFechaInicio] = useState(false);
    const [openFechaFin, setOpenFechaFin] = useState(false);

    const form = useForm<FormDataSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            funcionario_ids: [],
            tipo_sancion: "Suspencion",
            descripcion: "",
            fecha_inicio: new Date(),
            fecha_fin: undefined,
            activa: true,
            pdf_respaldo: undefined,
        },
    });

    // Sincronizar fecha_fin automáticamente para bajas definitivas
    const tipoSancion = form.watch("tipo_sancion");
    const fechaInicio = form.watch("fecha_inicio");
    const fechaFin = form.watch("fecha_fin");

    useEffect(() => {
        if (tipoSancion === "Baja Definitiva") {
            // Para baja definitiva, la fecha_fin debe ser igual a fecha_inicio
            if (fechaInicio) {
                form.setValue("fecha_fin", fechaInicio);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tipoSancion, fechaInicio]);

    const selectedFuncionarios = funcionarios
        ?.filter((f) => form.watch("funcionario_ids")?.includes(f.id))
        .slice()
        .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo)) || [];

    const removeFuncionario = (id: number) => {
        const current = form.getValues("funcionario_ids") || [];
        form.setValue("funcionario_ids", current.filter((i) => i !== id));
    };

    const formatDateSimple = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const onSubmit = (values: FormDataSchema) => {
        // Si se subió un PDF, enviamos FormData para incluir el archivo
        const file = form.getValues("pdf_respaldo") as File | undefined;
        if (file) {
            const formData = new FormData();
            formData.append('tipo_sancion', values.tipo_sancion);
            if (values.descripcion) formData.append('descripcion', values.descripcion);
            if (values.fecha_inicio) formData.append('fecha_inicio', formatDateSimple(values.fecha_inicio));
            if (values.fecha_fin) formData.append('fecha_fin', formatDateSimple(values.fecha_fin));
            formData.append('funcionario_id', String(values.funcionario_ids[0] || 0));
            // enviar array como funcionario_ids[] para que Laravel lo reciba como arreglo
            values.funcionario_ids.forEach((id) => formData.append('funcionario_ids[]', String(id)));
            formData.append('activa', String(values.activa ?? true));
            formData.append('pdf_respaldo', file);

            createMutation.mutate(formData as unknown as any, {
                onSuccess: () => {
                    closeBulkCreateDialog();
                    form.reset();
                    setOpenFuncionario(false);
                    setOpenFechaInicio(false);
                    setOpenFechaFin(false);
                },
            });
            return;
        }

        // Envío JSON cuando no hay archivo
        const payload: any = {
            tipo_sancion: values.tipo_sancion,
            descripcion: values.descripcion,
            fecha_inicio: values.fecha_inicio ? formatDateSimple(values.fecha_inicio) : undefined,
            fecha_fin: values.fecha_fin ? formatDateSimple(values.fecha_fin) : undefined,
            funcionario_id: values.funcionario_ids[0] || 0, // mantener compatibilidad
            funcionario_ids: values.funcionario_ids,
            activa: values.activa ?? true,
        };

        createMutation.mutate(payload, {
            onSuccess: () => {
                closeBulkCreateDialog();
                form.reset();
                setOpenFuncionario(false);
                setOpenFechaInicio(false);
                setOpenFechaFin(false);
            },
        });
    };

    const handleClose = () => {
        closeBulkCreateDialog();
        form.reset();
        setOpenFuncionario(false);
        setOpenFechaInicio(false);
        setOpenFechaFin(false);
    };

    return (
        <Dialog open={isBulkCreateDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="w-full max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Asignar sanción a varios
                    </DialogTitle>
                    <DialogDescription>Seleccione varios funcionarios y aplique la misma sanción a todos.</DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Funcionarios *</Label>
                        <Popover open={openFuncionario} onOpenChange={setOpenFuncionario}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={openFuncionario} className="w-full justify-between" disabled={loadingFuncionarios}>
                                    {selectedFuncionarios.length > 0 ? `${selectedFuncionarios.length} funcionario(s) seleccionado(s)` : "Seleccione uno o varios funcionarios..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Buscar funcionario..." />
                                    <CommandList>
                                        <CommandEmpty>No se encontró ningún funcionario.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {funcionarios?.slice().sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo)).map((func) => {
                                                const selected = form.watch("funcionario_ids")?.includes(func.id);
                                                return (
                                                    <CommandItem
                                                        key={func.id}
                                                        value={`${func.id}-${func.nombre_completo.toLowerCase()}`}
                                                        onSelect={() => {
                                                            const current: number[] = form.getValues("funcionario_ids") || [];
                                                            if (current.includes(func.id)) {
                                                                form.setValue("funcionario_ids", current.filter((i) => i !== func.id));
                                                            } else {
                                                                form.setValue("funcionario_ids", [...current, func.id]);
                                                            }
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
                                                        {func.nombre_completo}
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {selectedFuncionarios.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedFuncionarios.map((f) => (
                                    <Badge key={f.id} className="flex items-center gap-2">
                                        {f.nombre_completo}
                                        <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeFuncionario(f.id)} />
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {form.formState.errors.funcionario_ids && (
                            <p className="text-sm text-red-500">{form.formState.errors.funcionario_ids.message}</p>
                        )}
                    </div>

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>Tipo de Sanción *</Label>
                            <Select value={form.watch("tipo_sancion")} onValueChange={(v) => form.setValue("tipo_sancion", v as any)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione el tipo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {tipos?.map((t) => (
                                        <SelectItem key={t} value={t}>{t === "Suspencion" ? "Suspensión" : t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Textarea {...form.register("descripcion")} rows={3} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Fecha Inicio</Label>
                                <Popover open={openFechaInicio} onOpenChange={setOpenFechaInicio}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch("fecha_inicio") && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {fechaInicio ? formatDateSimple(fechaInicio as Date) : <span>Seleccionar fecha</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={form.watch("fecha_inicio")} onSelect={(date) => { if (date) form.setValue("fecha_inicio", date); setOpenFechaInicio(false); }} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha Fin</Label>
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
                                            {fechaFin ? (
                                                formatDateSimple(fechaFin as Date)
                                            ) : tipoSancion === "Baja Definitiva" ? (
                                                <span>Igual a fecha de inicio (permanente)</span>
                                            ) : (
                                                <span>Seleccionar fecha</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={form.watch("fecha_fin")}
                                            onSelect={(date) => {
                                                if (tipoSancion !== "Baja Definitiva" && date) {
                                                    form.setValue("fecha_fin", date);
                                                }
                                                setOpenFechaFin(false);
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
                            </div>
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
                                form.setValue('pdf_respaldo', file as File | undefined);
                            }}
                            className="cursor-pointer"
                        />
                        <div className="text-xs text-muted-foreground">
                            Sube un archivo PDF como respaldo de la sanción (máximo 10MB)
                        </div>
                        {form.formState.errors.pdf_respaldo && (
                            <p className="text-sm text-red-500">{form.formState.errors.pdf_respaldo.message as string}</p>
                        )}
                    </div>

                    {createMutation.error && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {(createMutation.error as any).message ?? 'Error al crear sanciones'}
                            </AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                        <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Creando..." : "Crear Sanciones"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
