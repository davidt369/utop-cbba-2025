"use client";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, X } from "lucide-react";
import { useCargosStore } from "@/store/cargos.store";
import { useCreateCargo } from "@/hooks/cargo.queries";
import { CargoCreateData } from "@/types/cargo.types";

// Schema de validación
const cargoSchema = z.object({
    nombre_cargo: z
        .string()
        .min(1, "El nombre del cargo es requerido")
        .max(100, "El nombre del cargo no puede exceder 100 caracteres"),
    descripcion: z
        .string()
        .max(255, "La descripción no puede exceder 255 caracteres")
        .optional(),
});

type CargoFormData = z.infer<typeof cargoSchema>;

export function CargoCreateDialog() {
    const { isCreateDialogOpen, closeCreateDialog } = useCargosStore();
    const createCargoMutation = useCreateCargo();

    const form = useForm<CargoFormData>({
        resolver: zodResolver(cargoSchema),
        defaultValues: {
            nombre_cargo: "",
            descripcion: "",
        },
    });

    const onSubmit = (data: CargoFormData) => {
        const createData: CargoCreateData = {
            nombre_cargo: data.nombre_cargo,
            descripcion: data.descripcion || undefined,
        };

        createCargoMutation.mutate(createData, {
            onSuccess: () => {
                closeCreateDialog();
                form.reset();
            },
        });
    };

    const handleClose = () => {
        closeCreateDialog();
        form.reset();
    };

    return (
        <Dialog open={isCreateDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Crear Nuevo Cargo
                    </DialogTitle>
                    <DialogDescription>
                        Ingresa la información del nuevo cargo a crear
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4">
                        {/* Nombre del cargo */}
                        <div className="space-y-2">
                            <Label htmlFor="nombre_cargo">Nombre del Cargo *</Label>
                            <Input
                                id="nombre_cargo"
                                placeholder="Ej: Director, Secretario, Analista..."
                                {...form.register("nombre_cargo")}
                            />
                            {form.formState.errors.nombre_cargo && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.nombre_cargo.message}
                                </p>
                            )}
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Textarea
                                id="descripcion"
                                placeholder="Descripción opcional del cargo..."
                                rows={3}
                                {...form.register("descripcion")}
                            />
                            {form.formState.errors.descripcion && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.descripcion.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {createCargoMutation.error && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {createCargoMutation.error.message || "Error al crear el cargo"}
                            </AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={createCargoMutation.isPending}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={createCargoMutation.isPending}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {createCargoMutation.isPending ? "Creando..." : "Crear Cargo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}