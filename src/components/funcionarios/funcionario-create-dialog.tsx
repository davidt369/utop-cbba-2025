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
import { Eye, EyeOff, Plus, X } from "lucide-react";
import { useFuncionariosStore } from "@/store/funcionarios.store";
import { useCreateFuncionario } from "@/hooks/funcionarios.queries";
import {
    FuncionarioCreateData,
    EXPEDIDO_OPTIONS,
    SEXO_OPTIONS,
    GRADO_JERARQUICO_OPTIONS,
    ESTADO_FUNCIONARIO_OPTIONS,
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
    estado_funcionario: z.enum([
        "Activo",
        "Suspendido",
        "Baja medica",
        "De Vacaciones",
        "En permiso",
        "Baja Definitiva"
    ]),

    // Datos del usuario
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    rol_id: z.number().default(3), // Solo rol de Usuario (id: 3)
});

type FuncionarioFormData = z.infer<typeof funcionarioSchema>;

export function FuncionarioCreateDialog() {
    const { isCreateDialogOpen, closeCreateDialog } = useFuncionariosStore();
    const createFuncionarioMutation = useCreateFuncionario();
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
            estado_funcionario: "Activo",
            email: "",
            password: "",
            rol_id: 3, // Siempre rol de Usuario
        },
    });

    const onSubmit = (data: FuncionarioFormData) => {
        // Preparar datos para enviar
        const createData: FuncionarioCreateData = {
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
            estado_funcionario: data.estado_funcionario,
            email: data.email,
            password: data.password,
            rol_id: 3, // Siempre rol de Usuario
        };

        createFuncionarioMutation.mutate(createData, {
            onSuccess: () => {
                closeCreateDialog();
                form.reset();
            },
        });
    };

    const handleClose = () => {
        closeCreateDialog();
        form.reset();
        setActiveTab("funcionario");
    };

    return (
        <Dialog open={isCreateDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Crear Funcionario
                    </DialogTitle>
                    <DialogDescription>
                        Complete la información del nuevo funcionario y su cuenta de usuario
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

                                <div className="space-y-2">
                                    <Label htmlFor="estado_funcionario">Estado *</Label>
                                    <Select
                                        value={form.watch("estado_funcionario")}
                                        onValueChange={(value) => form.setValue("estado_funcionario", value as any)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccione estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ESTADO_FUNCIONARIO_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                    <Label htmlFor="password">Contraseña *</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            {...form.register("password")}
                                            placeholder="Contraseña para el usuario"
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
                                </div>

                                {/* Información del rol (solo lectura) */}
                                <div className="space-y-2">
                                    <Label>Rol del Usuario</Label>
                                    <div className="p-3 bg-muted rounded-md">
                                        <p className="text-sm font-medium">Usuario</p>
                                        <p className="text-xs text-muted-foreground">
                                            Los funcionarios siempre tienen rol de Usuario en el sistema
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {createFuncionarioMutation.error && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {createFuncionarioMutation.error.message || "Error al crear el funcionario"}
                            </AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={createFuncionarioMutation.isPending}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={createFuncionarioMutation.isPending}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {createFuncionarioMutation.isPending ? "Creando..." : "Crear Funcionario"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}