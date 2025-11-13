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
import { Save, X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFuncionarioCargoStore } from "@/store/funcionarioCargo.store";
import { useUpdateFuncionarioCargo, useFuncionariosBasic, useCargosBasic } from "@/hooks/funcionarioCargo.queries";
import {
    FuncionarioCargoUpdateData,
    TIPO_AREA_OPTIONS,
} from "@/types/funcionarioCargo.types";

// Schema de validación
const funcionarioCargoSchema = z.object({
    funcionario_id: z.number().min(1, "Debe seleccionar un funcionario"),
    cargo_id: z.number().min(1, "Debe seleccionar un cargo"),
    tipo_area: z.enum(["Administrativa", "Operativa"], {
        message: "Debe seleccionar un tipo de área",
    }),
});

type FuncionarioCargoFormData = z.infer<typeof funcionarioCargoSchema>;

export function FuncionarioCargoEditDialog() {
    const { isEditDialogOpen, selectedFuncionarioCargo, closeEditDialog } = useFuncionarioCargoStore();
    const updateFuncionarioCargoMutation = useUpdateFuncionarioCargo();
    const { data: funcionarios, isLoading: isLoadingFuncionarios } = useFuncionariosBasic();
    const { data: cargos, isLoading: isLoadingCargos } = useCargosBasic();

    const [openFuncionario, setOpenFuncionario] = useState(false);
    const [openCargo, setOpenCargo] = useState(false);

    const form = useForm({
        resolver: zodResolver(funcionarioCargoSchema),
        defaultValues: {
            funcionario_id: 0,
            cargo_id: 0,
            tipo_area: "Administrativa" as const,
        },
    });

    // Poblar formulario cuando se selecciona un funcionario-cargo
    useEffect(() => {
        if (selectedFuncionarioCargo && isEditDialogOpen) {
            form.reset({
                funcionario_id: selectedFuncionarioCargo.funcionario.id,
                cargo_id: selectedFuncionarioCargo.cargo.id,
                tipo_area: selectedFuncionarioCargo.tipo_area,
            });
            setOpenFuncionario(false);
            setOpenCargo(false);
        }
    }, [selectedFuncionarioCargo, isEditDialogOpen, form]);

    const onSubmit = (data: FuncionarioCargoFormData) => {
        if (!selectedFuncionarioCargo) return;

        const updateData: FuncionarioCargoUpdateData = {
            funcionario_id: data.funcionario_id,
            cargo_id: data.cargo_id,
            tipo_area: data.tipo_area,
        };

        updateFuncionarioCargoMutation.mutate(
            { id: selectedFuncionarioCargo.id, data: updateData },
            {
                onSuccess: () => {
                    closeEditDialog();
                    form.reset();
                    setOpenFuncionario(false);
                    setOpenCargo(false);
                },
            }
        );
    };

    const handleClose = () => {
        closeEditDialog();
        form.reset();
        setOpenFuncionario(false);
        setOpenCargo(false);
    };

    if (!selectedFuncionarioCargo) return null;

    return (
        <Dialog open={isEditDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Save className="h-5 w-5" />
                        Editar Funcionario-Cargo
                    </DialogTitle>
                    <DialogDescription>
                        Editando asignación: <span className="font-semibold">
                            {selectedFuncionarioCargo.funcionario.nombre_completo} - {selectedFuncionarioCargo.cargo.nombre_cargo}
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
                    </div>

                    {updateFuncionarioCargoMutation.error && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {updateFuncionarioCargoMutation.error.message || "Error al actualizar la asignación"}
                            </AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={updateFuncionarioCargoMutation.isPending}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateFuncionarioCargoMutation.isPending}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {updateFuncionarioCargoMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}