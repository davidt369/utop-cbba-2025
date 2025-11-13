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
import { useUpdateUsuario, useRoles } from '@/hooks/usuarios.queries';
import { UpdateUsuarioData } from '@/types/usuario';
import { toast } from 'sonner';
import { useEffect } from 'react';

const formSchema = z.object({
    email: z.string().email({
        message: 'Debe ser un email válido.',
    }),
    password: z.string().optional(),
    rol_id: z.string().min(1, {
        message: 'Debe seleccionar un rol.',
    }),
});

export function UsuarioEditDialog() {
    const {
        isEditDialogOpen,
        setEditDialogOpen,
        selectedUsuario,
        closeAllDialogs
    } = useUsuariosStore();
    const { data: roles, isLoading: rolesLoading } = useRoles();
    const updateUsuario = useUpdateUsuario();

    // Filtrar roles para excluir SuperAdministrador a menos que el usuario ya sea SuperAdministrador
    const rolesDisponibles = roles?.filter((rol: any) => {
        if (selectedUsuario?.rol?.nombre_rol === 'SuperAdministrador') {
            // Si el usuario ya es SuperAdministrador, puede mantener su rol
            return true;
        }
        // Para otros usuarios, no permitir seleccionar SuperAdministrador
        return rol.nombre_rol !== 'SuperAdministrador';
    }) || [];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
            rol_id: '',
        },
    });

    // Cargar datos del usuario seleccionado
    useEffect(() => {
        if (selectedUsuario && isEditDialogOpen) {
            form.setValue('email', selectedUsuario.email);
            form.setValue('rol_id', selectedUsuario.rol_id.toString());
            form.setValue('password', ''); // Siempre vacío para edición
        }
    }, [selectedUsuario, isEditDialogOpen, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!selectedUsuario) return;

        try {
            const data: UpdateUsuarioData = {
                email: values.email,
                rol_id: parseInt(values.rol_id),
            };

            // Solo incluir password si se proporcionó
            if (values.password && values.password.trim() !== '') {
                data.password = values.password;
            }

            await updateUsuario.mutateAsync({
                id: selectedUsuario.id,
                data,
            });

            toast.success('Usuario actualizado exitosamente');
            form.reset();
            closeAllDialogs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al actualizar el usuario');
        }
    };

    const handleClose = () => {
        form.reset();
        setEditDialogOpen(false);
    };

    if (!selectedUsuario) return null;

    return (
        <Dialog open={isEditDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Usuario</DialogTitle>
                    <DialogDescription>
                        Modifica los datos del usuario. Deja la contraseña vacía si no deseas cambiarla.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="usuario@ejemplo.com"
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
                                    <FormLabel>Nueva Contraseña (opcional)</FormLabel>
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
                                    <Select onValueChange={field.onChange} value={field.value}>
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

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={updateUsuario.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={updateUsuario.isPending}
                            >
                                {updateUsuario.isPending ? 'Actualizando...' : 'Actualizar Usuario'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}