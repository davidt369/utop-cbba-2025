"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, X, Eye, EyeOff, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFuncionario, useUpdateFuncionario } from "@/hooks/funcionarios.queries";
import {
    FuncionarioUpdateData,
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
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
    rol_id: z.number(),
});

type FuncionarioFormData = z.infer<typeof funcionarioSchema>;

export default function EditFuncionarioPage() {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(params.id as string);

    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState("funcionario");

    const { data: funcionario, isLoading, error } = useFuncionario(id);
    const updateFuncionarioMutation = useUpdateFuncionario();

    const form = useForm<FuncionarioFormData>({
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

    // Poblar formulario cuando se carga el funcionario
    useEffect(() => {
        if (funcionario) {
            form.reset({
                primer_nombre: funcionario.primer_nombre,
                segundo_nombre: funcionario.segundo_nombre || "",
                primer_apellido: funcionario.primer_apellido,
                segundo_apellido: funcionario.segundo_apellido || "",
                numero_carnet: funcionario.numero_carnet || "",
                expedido: funcionario.expedido,
                sexo: funcionario.sexo,
                grado_jerarquico: funcionario.grado_jerarquico,
                direccion: funcionario.direccion || "",
                numero_celular: funcionario.numero_celular || "",
                numero_escalafon: funcionario.numero_escalafon || "",
                numero_cuenta_bancaria: funcionario.numero_cuenta_bancaria || "",
                estado_funcionario: funcionario.estado_funcionario,
                email: funcionario.usuario?.email || "",
                password: "",
                rol_id: 3, // Siempre rol de Usuario
            });
        }
    }, [funcionario, form]);

    const onSubmit = (data: FuncionarioFormData) => {
        if (!funcionario) return;

        // Preparar datos para enviar
        const updateData: FuncionarioUpdateData = {
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
            rol_id: 3, // Siempre rol de Usuario
        };

        // Solo incluir contraseña si se proporcionó una nueva
        if (data.password && data.password.trim() !== "") {
            updateData.password = data.password;
        }

        updateFuncionarioMutation.mutate(
            { id: funcionario.id, data: updateData },
            {
                onSuccess: () => {
                    router.push(`/dashboard/funcionarios/${funcionario.id}`);
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !funcionario) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                </div>
                <Alert variant="destructive">
                    <AlertDescription>
                        {error?.message || "No se pudo cargar la información del funcionario"}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const nombreCompleto = [
        funcionario.primer_nombre,
        funcionario.segundo_nombre,
        funcionario.primer_apellido,
        funcionario.segundo_apellido,
    ]
        .filter(Boolean)
        .join(" ");

    const isDeleted = !!funcionario.deleted_at;

    if (isDeleted) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                </div>
                <Alert variant="destructive">
                    <AlertDescription>
                        No se puede editar un funcionario eliminado. Debe restaurarlo primero.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Editar Funcionario</h1>
                        <p className="text-muted-foreground">{nombreCompleto}</p>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <Card>
                <CardHeader>
                    <CardTitle>Información del Funcionario</CardTitle>
                    <CardDescription>
                        Actualice la información del funcionario y su cuenta de usuario
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="funcionario">
                                    <User className="h-4 w-4 mr-2" />
                                    Datos del Funcionario
                                </TabsTrigger>
                                <TabsTrigger value="usuario">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Cuenta de Usuario
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="funcionario" className="space-y-6 mt-6">
                                {/* Datos personales */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Información Personal</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                </div>

                                {/* Documentos e identificación */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Identificación</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                <SelectTrigger>
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
                                                <SelectTrigger>
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
                                </div>

                                {/* Información profesional */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Información Profesional</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="grado_jerarquico">Grado Jerárquico *</Label>
                                            <Select
                                                value={form.watch("grado_jerarquico")}
                                                onValueChange={(value) => form.setValue("grado_jerarquico", value as any)}
                                            >
                                                <SelectTrigger>
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
                                                <SelectTrigger>
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
                                </div>

                                {/* Información adicional */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Información Adicional</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                </div>
                            </TabsContent>

                            <TabsContent value="usuario" className="space-y-6 mt-6">
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Información de Usuario</h3>
                                    <div className="space-y-4 max-w-md">
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
                                                <p className="text-sm font-medium">Usuario</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Los funcionarios siempre tienen rol de Usuario en el sistema
                                                </p>
                                            </div>
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

                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
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
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}