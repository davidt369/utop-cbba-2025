'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useUsuariosStore } from '@/store/usuarios.store';
import { useCreateUsuarioWithFuncionario, useRoles } from '@/hooks/usuarios.queries';
import { CreateUsuarioWithFuncionarioData } from '@/types/usuario';
import { toast } from 'sonner';
import { useState } from 'react';

const baseFormSchema = z.object({
    email: z.string().email({
        message: 'Debe ser un email válido.',
    }),
    password: z.string().min(8, {
        message: 'La contraseña debe tener al menos 8 caracteres.',
    }),
    rol_id: z.string().min(1, {
        message: 'Debe seleccionar un rol.',
    }),
});

const funcionarioFormSchema = z.object({
    primer_nombre: z.string().min(1, { message: 'El primer nombre es requerido' }),
    segundo_nombre: z.string().optional(),
    primer_apellido: z.string().min(1, { message: 'El primer apellido es requerido' }),
    segundo_apellido: z.string().optional(),
    numero_carnet: z.string().min(1, { message: 'El número de carnet es requerido' }),
    expedido: z.string().min(1, { message: 'El lugar de expedición es requerido' }),
    sexo: z.enum(['M', 'F'], { message: 'Debe seleccionar el sexo' }),
    grado_jerarquico: z.enum(['Coronel', 'Teniente coronel', 'Mayor', 'Capitán', 'Teniente', 'Sub teniente', 'Sub oficial superior', 'Sub oficial primero', 'Sub oficial segundo', 'Sargento mayor', 'Sargento primero', 'Sargento segundo', 'Sargento inicial'], { message: 'Debe seleccionar un grado jerárquico válido' }),
    direccion: z.string().optional(),
    numero_celular: z.string().optional(),
    numero_escalafon: z.string().optional(),
    numero_cuenta_bancaria: z.string().optional(),
});

// Siempre usar el schema completo (usuario + funcionario)
const formSchema = baseFormSchema.merge(funcionarioFormSchema);

export function UsuarioDialog() {
    const { isCreateDialogOpen, setCreateDialogOpen, closeAllDialogs } = useUsuariosStore();
    const { data: roles, isLoading: rolesLoading } = useRoles();
    const createUsuarioWithFuncionario = useCreateUsuarioWithFuncionario();

    // Filtrar roles para excluir SuperAdministrador
    const rolesDisponibles = roles?.filter((rol: any) => rol.nombre_rol !== 'SuperAdministrador') || [];

    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
            rol_id: '',
            // Valores por defecto para funcionario
            primer_nombre: '',
            segundo_nombre: '',
            primer_apellido: '',
            segundo_apellido: '',
            numero_carnet: '',
            expedido: '',
            sexo: '',
            grado_jerarquico: '',
            direccion: '',
            numero_celular: '',
            numero_escalafon: '',
            numero_cuenta_bancaria: '',
        },
    });

    const onSubmit = async (values: any) => {
        try {
            const data: CreateUsuarioWithFuncionarioData = {
                email: values.email,
                password: values.password,
                rol_id: parseInt(values.rol_id),
                primer_nombre: values.primer_nombre,
                segundo_nombre: values.segundo_nombre || undefined,
                primer_apellido: values.primer_apellido,
                segundo_apellido: values.segundo_apellido || undefined,
                numero_carnet: values.numero_carnet,
                expedido: values.expedido,
                sexo: values.sexo,
                grado_jerarquico: values.grado_jerarquico,
                direccion: values.direccion || undefined,
                numero_celular: values.numero_celular || undefined,
                numero_escalafon: values.numero_escalafon || undefined,
                numero_cuenta_bancaria: values.numero_cuenta_bancaria || undefined,
            };

            await createUsuarioWithFuncionario.mutateAsync(data);
            toast.success('Usuario y funcionario creados exitosamente');

            form.reset();
            closeAllDialogs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al crear el usuario');
        }
    };

    const handleClose = () => {
        form.reset();
        setCreateDialogOpen(false);
    };

    return (
        <Dialog open={isCreateDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario y Funcionario</DialogTitle>
                    <DialogDescription>
                        Complete el formulario para crear una nueva cuenta de usuario junto con los datos del funcionario.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Datos de Usuario</h3>

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="ejemplo@dominio.test"
                                                    type="email"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contraseña</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="••••••••"
                                                    type="password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="rol_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rol</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar rol" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {rolesLoading ? (
                                                        <SelectItem value="loading" disabled>
                                                            Cargando roles...
                                                        </SelectItem>
                                                    ) : (
                                                        rolesDisponibles.map((rol: any) => (
                                                            <SelectItem key={rol.id} value={rol.id.toString()}>
                                                                {rol.nombre_rol}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Datos del Funcionario</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="primer_nombre"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Primer Nombre *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Juan" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="segundo_nombre"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Segundo Nombre</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Carlos" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="primer_apellido"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Primer Apellido *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Pérez" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="segundo_apellido"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Segundo Apellido</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="González" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="numero_carnet"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Número de Carnet *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="12345678" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="expedido"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Expedido *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccione departamento" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {['LP', 'CB', 'SC', 'OR', 'PT', 'TJ', 'CH', 'BE', 'PD'].map((dept) => (
                                                            <SelectItem key={dept} value={dept}>
                                                                {dept}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="sexo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sexo *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="M">Masculino</SelectItem>
                                                        <SelectItem value="F">Femenino</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="grado_jerarquico"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Grado Jerárquico *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccione grado" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {['Coronel', 'Teniente coronel', 'Mayor', 'Capitán', 'Teniente', 'Sub teniente', 'Sub oficial superior', 'Sub oficial primero', 'Sub oficial segundo', 'Sargento mayor', 'Sargento primero', 'Sargento segundo', 'Sargento inicial'].map((grado) => (
                                                            <SelectItem key={grado} value={grado}>
                                                                {grado}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="numero_celular"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de Celular</FormLabel>
                                            <FormControl>
                                                <Input placeholder="70123456" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="direccion"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dirección</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Av. Ejemplo #123" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={createUsuarioWithFuncionario.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={createUsuarioWithFuncionario.isPending}
                            >
                                {createUsuarioWithFuncionario.isPending
                                    ? 'Creando...'
                                    : 'Crear Usuario y Funcionario'
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}