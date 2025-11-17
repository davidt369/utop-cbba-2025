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
import { useUpdateAusencia, useFuncionariosBasic, useFuncionariosDisponibles } from '@/hooks/ausencias.queries';
import useAusenciaStore from '@/store/ausencias.store';
import { ComboboxFuncionarios } from './combobox-funcionarios';

const editAusenciaSchema = z.object({
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

type EditAusenciaFormValues = z.infer<typeof editAusenciaSchema>;

export function AusenciaEditDialog() {
    const { isEditDialogOpen, selectedAusencia, closeEditDialog } = useAusenciaStore();
    // Para edición, usamos todos los funcionarios con información de elegibilidad para mostrar restricciones
    const { data: funcionarios = [], isLoading: isLoadingFuncionarios } = useFuncionariosBasic();
    const updateMutation = useUpdateAusencia();

    const [funcionarioOpen, setFuncionarioOpen] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);



    const form = useForm<EditAusenciaFormValues>({
        resolver: zodResolver(editAusenciaSchema),
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

    // Cargar datos cuando se abre el diálogo
    useEffect(() => {
        if (isEditDialogOpen && selectedAusencia) {
            // El funcionario_id está en selectedAusencia.funcionario.id, no en selectedAusencia.funcionario_id
            const funcionarioId = selectedAusencia.funcionario?.id;

            // console.log('🔍 DEBUGGING - Abriendo diálogo con ausencia:', selectedAusencia);
            // console.log('🔍 Funcionario ID a cargar:', funcionarioId, typeof funcionarioId);
            // console.log('🔍 Funcionarios disponibles:', funcionarios.length);
            // console.log('🔍 ¿Funcionario existe en lista?', funcionarios.find(f => f.id === funcionarioId));

            // Formatear fechas para input date usando el mismo método que en utils.ts
            const formatearFechaParaInput = (fecha: string) => {
                // Si es una fecha en formato YYYY-MM-DD, retornarla tal como está
                if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    return fecha;
                }

                // Si contiene 'T' (formato ISO), tomar solo la parte de la fecha
                if (fecha.includes('T')) {
                    return fecha.split('T')[0];
                }

                // Si contiene espacio (formato datetime), tomar solo la parte de la fecha
                if (fecha.includes(' ')) {
                    return fecha.split(' ')[0];
                }

                // Intentar parsear y formatear usando Date
                try {
                    const fechaObj = new Date(fecha);
                    // Agregar un día para compensar zona horaria si es necesario
                    const year = fechaObj.getFullYear();
                    const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
                    const day = String(fechaObj.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                } catch {
                    return fecha;
                }
            };

            const fechaInicioFormateada = formatearFechaParaInput(selectedAusencia.fecha_inicio);
            const fechaFinFormateada = formatearFechaParaInput(selectedAusencia.fecha_fin);

            const formData = {
                tipo_ausencia: selectedAusencia.tipo_ausencia,
                motivo: selectedAusencia.motivo || '',
                fecha_inicio: fechaInicioFormateada,
                fecha_fin: fechaFinFormateada,
                descripcion: selectedAusencia.descripcion || '',
                aprobado: selectedAusencia.aprobado,
                activo: selectedAusencia.activo,
                funcionario_id: funcionarioId, // Usar funcionarioId en lugar de selectedAusencia.funcionario_id
            };


            form.reset(formData);


        }
    }, [isEditDialogOpen, selectedAusencia, funcionarios]);



    // Efecto para actualizar automáticamente el campo "activo" basado en las fechas
    // Solo actualiza si el usuario no ha modificado manualmente el campo
    useEffect(() => {
        const subscription = form.watch((values, { name }) => {
            // Solo actualizar automáticamente si se cambiaron las fechas, no el campo activo
            if ((name === 'fecha_inicio' || name === 'fecha_fin') && values.fecha_inicio && values.fecha_fin) {
                const fechaInicio = new Date(values.fecha_inicio);
                const fechaFin = new Date(values.fecha_fin);
                const hoy = new Date();

                // Normalizar las fechas para comparar solo el día (sin horas)
                hoy.setHours(0, 0, 0, 0);
                fechaInicio.setHours(0, 0, 0, 0);
                fechaFin.setHours(0, 0, 0, 0);

                // La ausencia está activa si estamos dentro del período
                const estaActiva = hoy >= fechaInicio && hoy <= fechaFin;

                // Solo actualizar si el valor cambió y no fue una modificación manual del campo activo
                if (values.activo !== estaActiva) {
                    form.setValue('activo', estaActiva, { shouldValidate: true });
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [form]);

    const onSubmit = async (data: EditAusenciaFormValues) => {
        if (!selectedAusencia) return;

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

            updateMutation.mutate({
                id: selectedAusencia.id,
                data: jsonData,
            }, {
                onSuccess: () => {
                    form.reset();
                    closeEditDialog();
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

        updateMutation.mutate({
            id: selectedAusencia.id,
            data: formData,
        }, {
            onSuccess: () => {
                form.reset();
                closeEditDialog();
            },
        });
    };

    const handleClose = () => {
        form.reset();
        closeEditDialog();
    };

    const isLoading = updateMutation.isPending;

    if (!selectedAusencia) {
        return null;
    }

    // No mostrar el diálogo hasta que los funcionarios estén cargados
    if (isLoadingFuncionarios) {
        return (
            <Dialog open={isEditDialogOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[400px]">
                    <div className="flex items-center justify-center p-6">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Cargando funcionarios...
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isEditDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Ausencia</DialogTitle>
                    <DialogDescription>
                        Modifique los datos de la ausencia. Los cambios se guardarán al confirmar.
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
                                                showRestrictedFuncionarios={true}
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
                                                placeholder="Seleccionar fecha de inicio"
                                                {...field}
                                                min="1900-01-01"
                                                max="2100-12-31"
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
                                                placeholder="Seleccionar fecha de fin"
                                                {...field}
                                                min={form.watch('fecha_inicio') || '1900-01-01'}
                                                max="2100-12-31"
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
                                    <FormLabel>PDF de Respaldo</FormLabel>
                                    {selectedAusencia?.pdf_respaldo_ruta && (
                                        <div className="mb-2 p-2 border rounded bg-muted/50">
                                            <p className="text-sm text-muted-foreground">
                                                📄 Archivo actual: {selectedAusencia.pdf_respaldo_ruta.split('/').pop()}
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={isDownloadingPdf}
                                                onClick={async () => {
                                                    try {
                                                        setIsDownloadingPdf(true);

                                                        // Importar dinámicamente para evitar problemas de módulos
                                                        const { getToken } = await import('@/store/auth.store');
                                                        const token = getToken();

                                                        if (!token) {
                                                            alert('No hay sesión activa. Por favor, inicia sesión nuevamente.');
                                                            return;
                                                        }

                                                        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
                                                        const pdfUrl = `${baseUrl}/auth/ausencias/${selectedAusencia.id}/pdf`;

                                                        // Hacer fetch con autenticación
                                                        const response = await fetch(pdfUrl, {
                                                            headers: {
                                                                'Authorization': `Bearer ${token}`,
                                                                'Accept': 'application/pdf',
                                                            },
                                                        });

                                                        if (!response.ok) {
                                                            if (response.status === 401) {
                                                                alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
                                                                return;
                                                            }
                                                            if (response.status === 404) {
                                                                alert('El archivo PDF no fue encontrado.');
                                                                return;
                                                            }
                                                            throw new Error(`Error ${response.status}: ${response.statusText}`);
                                                        }

                                                        // Convertir a blob y descargar
                                                        const blob = await response.blob();
                                                        const blobUrl = URL.createObjectURL(blob);
                                                        const link = document.createElement('a');
                                                        link.href = blobUrl;
                                                        link.download = selectedAusencia.pdf_respaldo_ruta?.split('/').pop() || `ausencia-${selectedAusencia.id}.pdf`;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                        URL.revokeObjectURL(blobUrl);
                                                    } catch (error) {
                                                        console.error('Error al descargar PDF:', error);
                                                        alert('Error al descargar el PDF. Por favor, intenta nuevamente.');
                                                    } finally {
                                                        setIsDownloadingPdf(false);
                                                    }
                                                }}
                                                className="mt-1"
                                            >
                                                {isDownloadingPdf ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Descargando...
                                                    </>
                                                ) : (
                                                    'Descargar PDF actual'
                                                )}
                                            </Button>
                                        </div>
                                    )}
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
                                        {selectedAusencia?.pdf_respaldo_ruta
                                            ? "Sube un nuevo PDF para reemplazar el actual (máximo 10MB)"
                                            : "Sube un archivo PDF como respaldo (máximo 10MB)"
                                        }
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
                                Actualizar Ausencia
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}