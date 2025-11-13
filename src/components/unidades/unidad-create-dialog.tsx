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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, X } from "lucide-react";
import { useUnidadStore } from "@/store/unidad.store";
import { useCreateUnidad } from "@/hooks/unidad.queries";
import { UnidadCreateData } from "@/types/unidad.types";

// Schema de validación
const unidadSchema = z.object({
    nombre_unidad: z.string().min(1, "El nombre de la unidad es obligatorio").max(50, "Máximo 50 caracteres"),
    descripcion: z.string().max(255, "Máximo 255 caracteres").optional(),
});

type UnidadFormData = z.infer<typeof unidadSchema>;

export function UnidadCreateDialog() {
    const { isCreateDialogOpen, closeCreateDialog } = useUnidadStore();
    const createUnidadMutation = useCreateUnidad();

    const form = useForm({
        resolver: zodResolver(unidadSchema),
        defaultValues: {
            nombre_unidad: "",
            descripcion: "",
        },
    });

    const onSubmit = (data: UnidadFormData) => {
        const createData: UnidadCreateData = {
            nombre_unidad: data.nombre_unidad,
            descripcion: data.descripcion || undefined,
        };

        createUnidadMutation.mutate(createData, {
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
                        Crear Nueva Unidad
                    </DialogTitle>
                    <DialogDescription>
                        Crea una nueva unidad organizacional en el sistema
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4">
                        {/* Nombre de la unidad */}
                        <div className="space-y-2">
                            <Label htmlFor="nombre_unidad">Nombre de la Unidad *</Label>
                            <Input
                                id="nombre_unidad"
                                placeholder="Ej: Recursos Humanos"
                                {...form.register("nombre_unidad")}
                            />
                            {form.formState.errors.nombre_unidad && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.nombre_unidad.message}
                                </p>
                            )}
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Textarea
                                id="descripcion"
                                placeholder="Descripción de la unidad (opcional)"
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

                    {createUnidadMutation.error && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {createUnidadMutation.error.message || "Error al crear la unidad"}
                            </AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={createUnidadMutation.isPending}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={createUnidadMutation.isPending}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {createUnidadMutation.isPending ? "Creando..." : "Crear Unidad"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}