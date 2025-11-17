"use client";

import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Save, X } from "lucide-react";
import { useFuncionariosStore } from "@/store/funcionarios.store";
import { toast } from "sonner";
import {
    useUpdateFuncionarioDatos,
    useUpdateFuncionarioEmail,
    useUpdateFuncionarioPassword,
} from "@/hooks/funcionarios.queries";
import {
    FuncionarioUpdateData,
    EXPEDIDO_OPTIONS,
    SEXO_OPTIONS,
    GRADO_JERARQUICO_OPTIONS,
} from "@/types/funcionario.types";

// Schema de validación
const funcionarioSchema = z.object({
    // Datos del funcionario
    primer_nombre: z.string().min(1, "El primer nombre es requerido").max(50),
    segundo_nombre: z.string().max(50).optional(),
    primer_apellido: z.string().min(1, "El primer apellido es requerido").max(50),
    segundo_apellido: z.string().max(50).optional(),
    numero_carnet: z.string().max(20).optional(),
    expedido: z.enum(["LP", "OR", "PT", "CB", "CH", "TJ", "SC", "BE", "PA"]),
    sexo: z.enum(["M", "F"]),
    grado_jerarquico: z.enum([
        "Coronel",
        "Teniente coronel",
        "Mayor",
        "Capitán",
        "Teniente",
        "Sub teniente",
        "Sub oficial superior",
        "Sub oficial primero",
        "Sub oficial segundo",
        "Sargento mayor",
        "Sargento primero",
        "Sargento segundo",
        "Sargento inicial"
    ]),
    direccion: z.string().max(100).optional(),
    numero_celular: z.string().max(20).optional(),
    numero_escalafon: z.string().max(20).optional(),
    numero_cuenta_bancaria: z.string().max(20).optional(),

    // Datos del usuario
    email: z.email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
    rol_id: z.number().optional(), // Hacemos el rol opcional para no forzar cambios
});

type FuncionarioFormData = z.infer<typeof funcionarioSchema>;

export function FuncionarioEditDialog() {
    const { isEditDialogOpen, selectedFuncionario, closeEditDialog } = useFuncionariosStore();
    const updateFuncionarioMutation = useUpdateFuncionarioDatos();
    const updateFuncionarioEmail = useUpdateFuncionarioEmail();
    const updateFuncionarioPassword = useUpdateFuncionarioPassword();
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState("funcionario");

    const form = useForm({
        resolver: zodResolver(funcionarioSchema),
        defaultValues: {
            primer_nombre: "",
            segundo_nombre: "",
            primer_apellido: "",
            segundo_apellido: "",
            numero_carnet: "",
            expedido: "LP",
            sexo: "M",
            grado_jerarquico: "Sargento inicial",
            direccion: "",
            numero_celular: "",
            numero_escalafon: "",
            numero_cuenta_bancaria: "",
            email: "",
            password: "",
            rol_id: undefined, // No establecemos un valor por defecto
        },
    });

    // Poblar formulario cuando se selecciona un funcionario
    useEffect(() => {
        if (selectedFuncionario && isEditDialogOpen) {
            form.reset({
                primer_nombre: selectedFuncionario.primer_nombre,
                segundo_nombre: selectedFuncionario.segundo_nombre || "",
                primer_apellido: selectedFuncionario.primer_apellido,
                segundo_apellido: selectedFuncionario.segundo_apellido || "",
                numero_carnet: selectedFuncionario.numero_carnet || "",
                expedido: selectedFuncionario.expedido,
                sexo: selectedFuncionario.sexo,
                grado_jerarquico: selectedFuncionario.grado_jerarquico,
                direccion: selectedFuncionario.direccion || "",
                numero_celular: selectedFuncionario.numero_celular || "",
                numero_escalafon: selectedFuncionario.numero_escalafon || "",
                numero_cuenta_bancaria: selectedFuncionario.numero_cuenta_bancaria || "",
                email: selectedFuncionario.usuario?.email || "",
                password: "",
                rol_id: selectedFuncionario.usuario?.rol_id || undefined, // Mantener el rol actual
            });
        }
    }, [selectedFuncionario, isEditDialogOpen, form]);

    const onSubmit = async (data: FuncionarioFormData) => {
        if (!selectedFuncionario) return;

        try {
            // Si estamos en la pestaña de datos del funcionario -> actualizar datos
            if (activeTab === "funcionario") {
                const updateData = {
                    primer_nombre: data.primer_nombre,
                    segundo_nombre: data.segundo_nombre || undefined,
                    primer_apellido: data.primer_apellido,
                    segundo_apellido: data.segundo_apellido || undefined,
                    numero_carnet: data.numero_carnet || undefined,
                    expedido: data.expedido,
                    sexo: data.sexo,
                    grado_jerarquico: data.grado_jerarquico,
                    direccion: data.direccion || undefined,
                    numero_celular: data.numero_celular || undefined,
                    numero_escalafon: data.numero_escalafon || undefined,
                    numero_cuenta_bancaria: data.numero_cuenta_bancaria || undefined,
                };

                await updateFuncionarioMutation.mutateAsync({ id: selectedFuncionario.id, data: updateData });
                toast.success("Datos actualizados", {
                    description: "Los datos del funcionario han sido actualizados correctamente.",
                });
            }

            // Si estamos en la pestaña de usuario -> actualizar email y/o password según corresponda
            if (activeTab === "usuario") {
                // Actualizar email si cambió
                const newEmail = data.email?.trim();
                const currentEmail = selectedFuncionario.usuario?.email || "";
                if (newEmail && newEmail !== currentEmail) {
                    await updateFuncionarioEmail.mutateAsync({ id: selectedFuncionario.id, email: newEmail });
                    toast.success("Email actualizado", {
                        description: "El email ha sido actualizado correctamente.",
                    });
                }

                // Actualizar password si se proporcionó una nueva
                if (data.password && data.password.trim() !== "") {
                    await updateFuncionarioPassword.mutateAsync({ id: selectedFuncionario.id, password: data.password });
                    toast.success("Contraseña actualizada", {
                        description: "La contraseña ha sido actualizada correctamente.",
                    });
                }
            }

            // Si llegamos aquí, todo ok -> cerrar y resetear
            closeEditDialog();
            form.reset();
            setActiveTab("funcionario");
        } catch (error: any) {
            // Las mutaciones ya manejan la mayoría de errores; aquí podemos loguear
            console.error("Error al actualizar funcionario/usuario:", error);
            toast.error("Error al actualizar", {
                description: error.response?.data?.message || error.message || "No se pudieron guardar los cambios.",
            });
            // No cerramos el dialog para que el usuario vea el error
        }
    };

    const handleClose = () => {
        closeEditDialog();
        form.reset();
        setActiveTab("funcionario");
    };

    if (!selectedFuncionario) return null;

    const nombreCompleto = [
        selectedFuncionario.primer_nombre,
        selectedFuncionario.segundo_nombre,
        selectedFuncionario.primer_apellido,
        selectedFuncionario.segundo_apellido,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Dialog open={isEditDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Save className="h-5 w-5" />
                        Editar Funcionario
                    </DialogTitle>
                    <DialogDescription>
                        Editando información de: <span className="font-semibold">{nombreCompleto}</span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="funcionario">Datos del Funcionario</TabsTrigger>
                            <TabsTrigger value="usuario">Cuenta de Usuario</TabsTrigger>
                        </TabsList>

                        <TabsContent value="funcionario" className="space-y-4 mt-6">
                            {/* Datos personales */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="primer_nombre">Primer Nombre *</Label>
                                    <Input
                                        id="primer_nombre"
                                        {...form.register("primer_nombre")}
                                        placeholder="Primer nombre"
                                    />
                                    {form.formState.errors.primer_nombre && (
                                        <p className="text-sm text-red-500">
                                            {form.formState.errors.primer_nombre.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="segundo_nombre">Segundo Nombre</Label>
                                    <Input
                                        id="segundo_nombre"
                                        {...form.register("segundo_nombre")}
                                        placeholder="Segundo nombre (opcional)"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="primer_apellido">Primer Apellido *</Label>
                                    <Input
                                        id="primer_apellido"
                                        {...form.register("primer_apellido")}
                                        placeholder="Primer apellido"
                                    />
                                    {form.formState.errors.primer_apellido && (
                                        <p className="text-sm text-red-500">
                                            {form.formState.errors.primer_apellido.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="segundo_apellido">Segundo Apellido</Label>
                                    <Input
                                        id="segundo_apellido"
                                        {...form.register("segundo_apellido")}
                                        placeholder="Segundo apellido (opcional)"
                                    />
                                </div>
                            </div>

                            {/* Documentos e identificación */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="numero_carnet">Número de Carnet</Label>
                                    <Input
                                        id="numero_carnet"
                                        {...form.register("numero_carnet")}
                                        placeholder="Número de carnet"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expedido">Expedido *</Label>
                                    <Select
                                        value={form.watch("expedido")}
                                        onValueChange={(value) => form.setValue("expedido", value as any)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccione departamento" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EXPEDIDO_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sexo">Sexo *</Label>
                                    <Select
                                        value={form.watch("sexo")}
                                        onValueChange={(value) => form.setValue("sexo", value as any)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccione sexo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SEXO_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Información profesional */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="grado_jerarquico">Grado Jerárquico *</Label>
                                    <Select
                                        value={form.watch("grado_jerarquico")}
                                        onValueChange={(value) => form.setValue("grado_jerarquico", value as any)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccione grado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {GRADO_JERARQUICO_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Estado no editable - solo se muestra como información */}
                                <div className="space-y-2">
                                    <Label htmlFor="estado_funcionario_display">Estado (Solo lectura)</Label>
                                    <Input
                                        id="estado_funcionario_display"
                                        value={selectedFuncionario?.estado_funcionario || ''}
                                        disabled
                                        className="bg-gray-50 text-gray-600"
                                    />
                                </div>
                            </div>

                            {/* Información adicional */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="numero_escalafon">Número de Escalafón</Label>
                                    <Input
                                        id="numero_escalafon"
                                        {...form.register("numero_escalafon")}
                                        placeholder="Número de escalafón"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="numero_celular">Número de Celular</Label>
                                    <Input
                                        id="numero_celular"
                                        {...form.register("numero_celular")}
                                        placeholder="Número de celular"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="direccion">Dirección</Label>
                                    <Input
                                        id="direccion"
                                        {...form.register("direccion")}
                                        placeholder="Dirección de domicilio"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="numero_cuenta_bancaria">Número de Cuenta Bancaria</Label>
                                    <Input
                                        id="numero_cuenta_bancaria"
                                        {...form.register("numero_cuenta_bancaria")}
                                        placeholder="Número de cuenta bancaria"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="usuario" className="space-y-4 mt-6">
                            {/* Información de usuario */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...form.register("email")}
                                        placeholder="correo@ejemplo.com"
                                    />
                                    {form.formState.errors.email && (
                                        <p className="text-sm text-red-500">
                                            {form.formState.errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Nueva Contraseña</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            {...form.register("password")}
                                            placeholder="Dejar en blanco para mantener actual"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {form.formState.errors.password && (
                                        <p className="text-sm text-red-500">
                                            {form.formState.errors.password.message}
                                        </p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Deje en blanco si no desea cambiar la contraseña actual
                                    </p>
                                </div>

                                {/* Información del rol (solo lectura) */}
                                <div className="space-y-2">
                                    <Label>Rol del Usuario</Label>
                                    <div className="p-3 bg-muted rounded-md">
                                        <p className="text-sm font-medium">
                                            {selectedFuncionario.usuario?.rol?.nombre_rol || 'Sin rol asignado'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            El rol del usuario se mantiene sin cambios. Para modificar el rol, use la gestión de usuarios.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {updateFuncionarioMutation.error && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {updateFuncionarioMutation.error.message || "Error al actualizar el funcionario"}
                            </AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={updateFuncionarioMutation.isPending}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateFuncionarioMutation.isPending}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {updateFuncionarioMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
