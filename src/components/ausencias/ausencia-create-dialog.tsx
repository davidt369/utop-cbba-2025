'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { AusenciaFormData, TIPOS_AUSENCIA } from '@/types/ausencia.types';
import { useCreateAusencia, useFuncionariosBasic, useFuncionariosDisponibles } from '@/hooks/ausencias.queries';
import useAusenciaStore from '@/store/ausencias.store';
import { ComboboxFuncionarios } from './combobox-funcionarios';

const createAusenciaSchema = z.object({
    tipo_ausencia: z.enum(['Permiso', 'Baja Médica', 'Vacaciones'], { message: 'Selecciona un tipo de ausencia' }),
    motivo: z.string().max(60, 'El motivo no puede exceder 60 caracteres').optional(),
    fecha_inicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
    fecha_fin: z.string().min(1, 'La fecha de fin es obligatoria'),
    descripcion: z.string().max(255, 'La descripción no puede exceder 255 caracteres').optional(),
    aprobado: z.boolean(),
    activo: z.boolean(),
    funcionario_id: z.number({ message: 'Selecciona un funcionario' }).min(1, 'Selecciona un funcionario'),
    pdf_respaldo: z.instanceof(File).optional(),
}).refine((data) => {
    if (data.fecha_inicio && data.fecha_fin) {
        return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
    }
    return true;
}, {
    message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
    path: ['fecha_fin'],
}).refine((data) => {
    if (data.pdf_respaldo) {
        return data.pdf_respaldo.type === 'application/pdf' && data.pdf_respaldo.size <= 10 * 1024 * 1024; // 10MB
    }
    return true;
}, {
    message: 'El archivo debe ser un PDF y no exceder 10MB',
    path: ['pdf_respaldo'],
});

type CreateAusenciaFormValues = z.infer<typeof createAusenciaSchema>;

export function AusenciaCreateDialog() {
    const { isCreateDialogOpen, closeCreateDialog } = useAusenciaStore();
    // Usar funcionarios disponibles para mejor UX - solo muestra funcionarios elegibles
    const { data: funcionarios = [], isLoading: isLoadingFuncionarios } = useFuncionariosDisponibles();
    // También obtenemos todos los funcionarios con información de elegibilidad para mostrar restricciones si es necesario
    const { data: todosFuncionarios = [] } = useFuncionariosBasic();
    const createMutation = useCreateAusencia();

    const [funcionarioOpen, setFuncionarioOpen] = useState(false);

    const form = useForm<CreateAusenciaFormValues>({
        resolver: zodResolver(createAusenciaSchema),
        defaultValues: {
            tipo_ausencia: 'Permiso',
            motivo: '',
            fecha_inicio: '',
            fecha_fin: '',
            descripcion: '',
            aprobado: false,
            activo: true,
            funcionario_id: undefined,
            pdf_respaldo: undefined,
        },
    });

    // Efecto para actualizar automáticamente el campo "activo" basado en las fechas
    useEffect(() => {
        const subscription = form.watch((values) => {
            if (values.fecha_inicio && values.fecha_fin) {
                const fechaInicio = new Date(values.fecha_inicio);
                const fechaFin = new Date(values.fecha_fin);
                const hoy = new Date();

                // Normalizar las fechas para comparar solo el día (sin horas)
                hoy.setHours(0, 0, 0, 0);
                fechaInicio.setHours(0, 0, 0, 0);
                fechaFin.setHours(0, 0, 0, 0);

                // La ausencia está activa si estamos dentro del período
                const estaActiva = hoy >= fechaInicio && hoy <= fechaFin;

                // Solo actualizar si el valor cambió para evitar loops infinitos
                if (values.activo !== estaActiva) {
                    form.setValue('activo', estaActiva, { shouldValidate: true });
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [form]);

    const onSubmit = async (data: CreateAusenciaFormValues) => {
        // Si no hay archivo PDF, enviar como JSON regular
        if (!data.pdf_respaldo) {
            const jsonData: AusenciaFormData = {
                tipo_ausencia: data.tipo_ausencia,
                fecha_inicio: data.fecha_inicio,
                fecha_fin: data.fecha_fin,
                aprobado: data.aprobado,
                funcionario_id: data.funcionario_id,
                motivo: data.motivo || undefined,
                descripcion: data.descripcion || undefined,
            };

            createMutation.mutate(jsonData, {
                onSuccess: () => {
                    form.reset();
                    closeCreateDialog();
                },
            });
            return;
        }

        // Si hay archivo PDF, enviar como FormData
        const formData = new FormData();

        // Agregar campos de texto obligatorios
        formData.append('tipo_ausencia', data.tipo_ausencia);
        formData.append('fecha_inicio', data.fecha_inicio);
        formData.append('fecha_fin', data.fecha_fin);
        formData.append('aprobado', data.aprobado.toString());
        formData.append('funcionario_id', String(data.funcionario_id));

        // Agregar campos opcionales
        if (data.motivo) formData.append('motivo', data.motivo);
        if (data.descripcion) formData.append('descripcion', data.descripcion);
        if (data.pdf_respaldo) formData.append('pdf_respaldo', data.pdf_respaldo);

        createMutation.mutate(formData, {
            onSuccess: () => {
                form.reset();
                closeCreateDialog();
            },
        });
    };

    const handleClose = () => {
        form.reset();
        closeCreateDialog();
    };

    const isLoading = createMutation.isPending;

    return (
        <Dialog open={isCreateDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Ausencia</DialogTitle>
                    <DialogDescription>
                        Registre una nueva ausencia para un funcionario. Complete todos los campos requeridos.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Funcionario */}
                            <FormField
                                control={form.control}
                                name="funcionario_id"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Funcionario *</FormLabel>
                                        <FormControl>
                                            <ComboboxFuncionarios
                                                funcionarios={funcionarios}
                                                value={field.value}
                                                onChange={field.onChange}
                                                open={funcionarioOpen}
                                                setOpen={setFuncionarioOpen}
                                                loading={isLoadingFuncionarios}
                                                placeholder="Seleccionar funcionario..."
                                                showRestrictedFuncionarios={false}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Tipo de Ausencia */}
                            <FormField
                                control={form.control}
                                name="tipo_ausencia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Ausencia *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona el tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {TIPOS_AUSENCIA.map((tipo) => (
                                                    <SelectItem key={tipo.value} value={tipo.value}>
                                                        {tipo.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Fechas en una fila */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Fecha Inicio */}
                            <FormField
                                control={form.control}
                                name="fecha_inicio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha Inicio *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                className="w-full"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Fecha Fin */}
                            <FormField
                                control={form.control}
                                name="fecha_fin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha Fin *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                className="w-full"
                                                min={form.watch('fecha_inicio') || undefined}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Motivo */}
                        <FormField
                            control={form.control}
                            name="motivo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Motivo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Motivo de la ausencia" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Descripción */}
                        <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descripción adicional de la ausencia..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* PDF de Respaldo */}
                        <FormField
                            control={form.control}
                            name="pdf_respaldo"
                            render={({ field: { value, onChange, ...field } }) => (
                                <FormItem>
                                    <FormLabel>PDF de Respaldo (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                onChange(file);
                                            }}
                                            {...field}
                                        />
                                    </FormControl>
                                    <div className="text-xs text-muted-foreground">
                                        Sube un archivo PDF como respaldo de la ausencia (máximo 10MB)
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Estados en una fila */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Aprobado */}
                            <FormField
                                control={form.control}
                                name="aprobado"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Aprobado</FormLabel>
                                            <div className="text-[0.8rem] text-muted-foreground">
                                                Marque si la ausencia está aprobada
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Activo - Solo lectura, calculado automáticamente */}
                            <FormField
                                control={form.control}
                                name="activo"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/30">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-muted-foreground">Estado (Automático)</FormLabel>
                                            <div className="text-[0.8rem] text-muted-foreground">
                                                {field.value ? '✅ Activo - Dentro del período' : '❌ Inactivo - Fuera del período'}
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={() => { }} // No hacer nada
                                                disabled={true}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Crear Ausencia
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}