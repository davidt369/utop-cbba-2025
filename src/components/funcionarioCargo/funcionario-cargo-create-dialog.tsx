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
import { Plus, X, Search, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFuncionarioCargoStore } from "@/store/funcionarioCargo.store";
import { useCreateFuncionarioCargo, useFuncionariosBasic, useCargosBasic } from "@/hooks/funcionarioCargo.queries";
import { TIPO_AREA_OPTIONS } from "@/types/funcionarioCargo.types";
import { Input } from "@/components/ui/input";

// Schema de validación (asignación individual)
const funcionarioCargoSchema = z.object({
    funcionario_id: z.number().min(1, "Debe seleccionar un funcionario"),
    cargo_id: z.number().min(1, "Debe seleccionar un cargo"),
    tipo_area: z.enum(["Administrativa", "Operativa"] as const, {
        message: "Debe seleccionar un tipo de área",
    }),
    fecha_asignacion: z.string().optional(),
});

type FuncionarioCargoFormData = z.infer<typeof funcionarioCargoSchema>;

export function FuncionarioCargoCreateDialog() {
    const { isCreateDialogOpen, closeCreateDialog } = useFuncionarioCargoStore();
    const createFuncionarioCargoMutation = useCreateFuncionarioCargo();
    const { data: funcionarios, isLoading: isLoadingFuncionarios } = useFuncionariosBasic();
    const { data: cargos, isLoading: isLoadingCargos } = useCargosBasic();

    const [openFuncionario, setOpenFuncionario] = useState(false);
    const [openCargo, setOpenCargo] = useState(false);

    const form = useForm<FuncionarioCargoFormData>({
        resolver: zodResolver(funcionarioCargoSchema),
        defaultValues: {
            funcionario_id: 0,
            cargo_id: 0,
            tipo_area: "Administrativa" as const,
            fecha_asignacion: new Date().toISOString().split('T')[0],
        },
    });

    const onSubmit = (data: FuncionarioCargoFormData) => {
        createFuncionarioCargoMutation.mutate(data, {
            onSuccess: () => {
                closeCreateDialog();
                form.reset();
                setOpenFuncionario(false);
                setOpenCargo(false);
            },
        });
    };

    const handleClose = () => {
        closeCreateDialog();
        form.reset();
        setOpenFuncionario(false);
        setOpenCargo(false);
    };

    return (
        <Dialog open={isCreateDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Crear Funcionario-Cargo
                    </DialogTitle>
                    <DialogDescription>
                        Asigna un cargo a un funcionario en un área específica
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
                                        disabled={isLoadingFuncionarios}
                                    >
                                        {form.watch("funcionario_id")
                                            ? funcionarios?.find((funcionario) => funcionario.id === form.watch("funcionario_id"))?.nombre_completo
                                            : "Seleccione un funcionario..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar funcionario..." />
                                        <CommandEmpty>No se encontró ningún funcionario.</CommandEmpty>
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
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {form.formState.errors.funcionario_id && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.funcionario_id.message}
                                </p>
                            )}
                        </div>

                        {/* Seleccionar cargo */}
                        <div className="space-y-2">
                            <Label htmlFor="cargo_id">Cargo *</Label>
                            <Popover open={openCargo} onOpenChange={setOpenCargo}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCargo}
                                        className="w-full justify-between"
                                        disabled={isLoadingCargos}
                                    >
                                        {form.watch("cargo_id")
                                            ? cargos?.find((cargo) => cargo.id === form.watch("cargo_id"))?.nombre_cargo
                                            : "Seleccione un cargo..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar cargo..." />
                                        <CommandEmpty>No se encontró ningún cargo.</CommandEmpty>
                                        <CommandGroup>
                                            {cargos?.map((cargo) => (
                                                <CommandItem
                                                    key={cargo.id}
                                                    value={cargo.nombre_cargo}
                                                    onSelect={() => {
                                                        form.setValue("cargo_id", cargo.id);
                                                        setOpenCargo(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            form.watch("cargo_id") === cargo.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {cargo.nombre_cargo}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {form.formState.errors.cargo_id && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.cargo_id.message}
                                </p>
                            )}
                        </div>

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
                                {createFuncionarioCargoMutation.error.message || "Error al crear la asignación"}
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
                            <Plus className="h-4 w-4 mr-2" />
                            {createFuncionarioCargoMutation.isPending ? "Creando..." : "Crear Asignación"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}