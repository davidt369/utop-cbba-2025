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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Users, X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFuncionarioCargoStore } from "@/store/funcionarioCargo.store";
import { useCreateFuncionarioCargo, useFuncionariosBasic, useCargosBasic } from "@/hooks/funcionarioCargo.queries";
import { TIPO_AREA_OPTIONS } from "@/types/funcionarioCargo.types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Schema de validación para asignaciones masivas
const funcionarioCargoBulkSchema = z.object({
    funcionario_ids: z.array(z.number().min(1)).min(1, "Debe seleccionar al menos un funcionario"),
    cargo_ids: z.array(z.number().min(1)).min(1, "Debe seleccionar al menos un cargo"),
    tipo_area: z.enum(["Administrativa", "Operativa"] as const, {
        message: "Debe seleccionar un tipo de área",
    }),
    fecha_asignacion: z.string().optional(),
});

type FuncionarioCargoBulkFormData = z.infer<typeof funcionarioCargoBulkSchema>;

export function FuncionarioCargoBulkDialog() {
    const { isBulkDialogOpen, closeBulkDialog } = useFuncionarioCargoStore();
    const createFuncionarioCargoMutation = useCreateFuncionarioCargo();
    const { data: funcionarios, isLoading: isLoadingFuncionarios } = useFuncionariosBasic();
    const { data: cargos, isLoading: isLoadingCargos } = useCargosBasic();

    const [openFuncionario, setOpenFuncionario] = useState(false);
    const [openCargo, setOpenCargo] = useState(false);

    const form = useForm<FuncionarioCargoBulkFormData>({
        resolver: zodResolver(funcionarioCargoBulkSchema),
        defaultValues: {
            funcionario_ids: [],
            cargo_ids: [],
            tipo_area: "Administrativa" as const,
            fecha_asignacion: new Date().toISOString().split('T')[0],
        },
    });

    const onSubmit = (data: FuncionarioCargoBulkFormData) => {
        const payload = {
            funcionario_ids: data.funcionario_ids,
            cargo_ids: data.cargo_ids,
            tipo_area: data.tipo_area,
            fecha_asignacion: data.fecha_asignacion,
        };

        createFuncionarioCargoMutation.mutate(payload as any, {
            onSuccess: () => {
                closeBulkDialog();
                form.reset();
                setOpenFuncionario(false);
                setOpenCargo(false);
            },
        });
    };

    const handleClose = () => {
        closeBulkDialog();
        form.reset();
        setOpenFuncionario(false);
        setOpenCargo(false);
    };

    // Funciones para remover items seleccionados
    const removeFuncionario = (id: number) => {
        const current = form.getValues("funcionario_ids");
        form.setValue("funcionario_ids", current.filter((fId) => fId !== id));
    };

    const removeCargo = (id: number) => {
        const current = form.getValues("cargo_ids");
        form.setValue("cargo_ids", current.filter((cId) => cId !== id));
    };

    const selectedFuncionarios = funcionarios?.filter((f) =>
        form.watch("funcionario_ids")?.includes(f.id)
    ) || [];

    const selectedCargos = cargos?.filter((c) =>
        form.watch("cargo_ids")?.includes(c.id)
    ) || [];

    return (
        <Dialog open={isBulkDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Asignaciones Masivas
                    </DialogTitle>
                    <DialogDescription>
                        Asigna múltiples funcionarios a múltiples cargos en una sola operación
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4">
                        {/* Seleccionar múltiples funcionarios */}
                        <div className="space-y-2">
                            <Label htmlFor="funcionario_ids">Funcionarios *</Label>
                            <Popover open={openFuncionario} onOpenChange={setOpenFuncionario}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openFuncionario}
                                        className="w-full justify-between"
                                        disabled={isLoadingFuncionarios}
                                    >
                                        {selectedFuncionarios.length > 0
                                            ? `${selectedFuncionarios.length} funcionario(s) seleccionado(s)`
                                            : "Seleccione uno o varios funcionarios..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar funcionario..." />
                                        <CommandEmpty>No se encontró ningún funcionario.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {funcionarios?.map((funcionario) => {
                                                const selected = form.watch("funcionario_ids")?.includes(funcionario.id);
                                                return (
                                                    <CommandItem
                                                        key={funcionario.id}
                                                        value={`${funcionario.id}-${funcionario.nombre_completo.toLowerCase()}`}
                                                        keywords={[funcionario.nombre_completo]}
                                                        onSelect={() => {
                                                            const current: number[] = form.getValues("funcionario_ids") || [];
                                                            if (current.includes(funcionario.id)) {
                                                                form.setValue(
                                                                    "funcionario_ids",
                                                                    current.filter((id) => id !== funcionario.id)
                                                                );
                                                            } else {
                                                                form.setValue("funcionario_ids", [...current, funcionario.id]);
                                                            }
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selected ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {funcionario.nombre_completo}
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            {/* Mostrar funcionarios seleccionados con badges */}
                            {selectedFuncionarios.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedFuncionarios.map((func) => (
                                        <Badge key={func.id} variant="secondary" className="flex items-center gap-1">
                                            {func.nombre_completo}
                                            <X
                                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                                onClick={() => removeFuncionario(func.id)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {form.formState.errors.funcionario_ids && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.funcionario_ids.message}
                                </p>
                            )}
                        </div>

                        {/* Seleccionar múltiples cargos */}
                        <div className="space-y-2">
                            <Label htmlFor="cargo_ids">Cargos *</Label>
                            <Popover open={openCargo} onOpenChange={setOpenCargo}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCargo}
                                        className="w-full justify-between"
                                        disabled={isLoadingCargos}
                                    >
                                        {selectedCargos.length > 0
                                            ? `${selectedCargos.length} cargo(s) seleccionado(s)`
                                            : "Seleccione uno o varios cargos..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar cargo..." />
                                        <CommandEmpty>No se encontró ningún cargo.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {cargos?.map((cargo) => {
                                                const selected = form.watch("cargo_ids")?.includes(cargo.id);
                                                return (
                                                    <CommandItem
                                                        key={cargo.id}
                                                        value={`${cargo.id}-${cargo.nombre_cargo.toLowerCase()}`}
                                                        keywords={[cargo.nombre_cargo]}
                                                        onSelect={() => {
                                                            const current: number[] = form.getValues("cargo_ids") || [];
                                                            if (current.includes(cargo.id)) {
                                                                form.setValue(
                                                                    "cargo_ids",
                                                                    current.filter((id) => id !== cargo.id)
                                                                );
                                                            } else {
                                                                form.setValue("cargo_ids", [...current, cargo.id]);
                                                            }
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selected ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {cargo.nombre_cargo}
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            {/* Mostrar cargos seleccionados con badges */}
                            {selectedCargos.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedCargos.map((cargo) => (
                                        <Badge key={cargo.id} variant="secondary" className="flex items-center gap-1">
                                            {cargo.nombre_cargo}
                                            <X
                                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                                onClick={() => removeCargo(cargo.id)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {form.formState.errors.cargo_ids && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.cargo_ids.message}
                                </p>
                            )}
                        </div>

                        {/* Resumen de combinaciones */}
                        {selectedFuncionarios.length > 0 && selectedCargos.length > 0 && (
                            <Alert>
                                <AlertDescription>
                                    Se crearán <strong>{selectedFuncionarios.length * selectedCargos.length}</strong> asignaciones
                                    ({selectedFuncionarios.length} funcionario(s) × {selectedCargos.length} cargo(s))
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Tipo de área */}
                        <div className="space-y-2">
                            <Label htmlFor="tipo_area">Tipo de Área *</Label>
                            <Select
                                value={form.watch("tipo_area")}
                                onValueChange={(value) => form.setValue("tipo_area", value as any)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione el tipo de área" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIPO_AREA_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.tipo_area && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.tipo_area.message}
                                </p>
                            )}
                        </div>

                        {/* Fecha de asignación */}
                        <div className="space-y-2">
                            <Label htmlFor="fecha_asignacion">Fecha de Asignación</Label>
                            <Input
                                type="date"
                                value={form.watch("fecha_asignacion")}
                                onChange={(e) => form.setValue("fecha_asignacion", e.target.value)}
                                className="w-full"
                            />
                            {form.formState.errors.fecha_asignacion && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.fecha_asignacion.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {createFuncionarioCargoMutation.error && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {createFuncionarioCargoMutation.error.message || "Error al crear las asignaciones"}
                            </AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={createFuncionarioCargoMutation.isPending}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={createFuncionarioCargoMutation.isPending}
                        >
                            <Users className="h-4 w-4 mr-2" />
                            {createFuncionarioCargoMutation.isPending ? "Creando..." : "Crear Asignaciones"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
