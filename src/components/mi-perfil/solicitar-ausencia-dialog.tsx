'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, Clock, Send, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSolicitarAusencia } from '@/hooks/mi-perfil.queries';

const TIPOS_AUSENCIA = [
    { value: 'Permiso' as const, label: 'Permiso' },
    { value: 'Baja Médica' as const, label: 'Baja Médica' },
    { value: 'Vacaciones' as const, label: 'Vacaciones' },
];

const solicitarAusenciaSchema = z.object({
    tipo_ausencia: z.enum(['Permiso', 'Baja Médica', 'Vacaciones'], { message: 'Selecciona un tipo de ausencia' }),
    motivo: z.string().max(60, 'El motivo no puede exceder 60 caracteres').optional(),
    fecha_inicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
    fecha_fin: z.string().min(1, 'La fecha de fin es obligatoria'),
    descripcion: z.string().max(255, 'La descripción no puede exceder 255 caracteres').optional(),
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

type SolicitarAusenciaFormValues = z.infer<typeof solicitarAusenciaSchema>;

interface SolicitarAusenciaDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SolicitarAusenciaDialog({ isOpen, onClose }: SolicitarAusenciaDialogProps) {
    const solicitarMutation = useSolicitarAusencia();

    const form = useForm<SolicitarAusenciaFormValues>({
        resolver: zodResolver(solicitarAusenciaSchema),
        defaultValues: {
            tipo_ausencia: 'Permiso',
            motivo: '',
            fecha_inicio: '',
            fecha_fin: '',
            descripcion: '',
            pdf_respaldo: undefined,
        },
    });

    // Calcular días de ausencia
    const watchedDates = form.watch(['fecha_inicio', 'fecha_fin']);
    const diasAusencia = watchedDates[0] && watchedDates[1]
        ? Math.abs(new Date(watchedDates[1]).getTime() - new Date(watchedDates[0]).getTime()) / (1000 * 60 * 60 * 24) + 1
        : 0;

    // Verificar si la ausencia estaría activa
    const estaActiva = watchedDates[0] && watchedDates[1]
        ? new Date() >= new Date(watchedDates[0]) && new Date() <= new Date(watchedDates[1])
        : false;

    const onSubmit = async (data: SolicitarAusenciaFormValues) => {
        // Si no hay archivo PDF, enviar como JSON regular
        if (!data.pdf_respaldo) {
            const jsonData = {
                tipo_ausencia: data.tipo_ausencia,
                fecha_inicio: data.fecha_inicio,
                fecha_fin: data.fecha_fin,
                motivo: data.motivo || undefined,
                descripcion: data.descripcion || undefined,
            };

            solicitarMutation.mutate(jsonData, {
                onSuccess: () => {
                    form.reset();
                    onClose();
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

        // Agregar campos opcionales
        if (data.motivo) formData.append('motivo', data.motivo);
        if (data.descripcion) formData.append('descripcion', data.descripcion);
        if (data.pdf_respaldo) formData.append('pdf_respaldo', data.pdf_respaldo);

        solicitarMutation.mutate(formData, {
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    const isLoading = solicitarMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Solicitar Ausencia
                    </DialogTitle>
                    <DialogDescription>
                        Envía una solicitud de ausencia que será revisada por tu supervisor.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Tipo de Ausencia */}
                        <FormField
                            control={form.control}
                            name="tipo_ausencia"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Ausencia</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona el tipo de ausencia" />
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

                        {/* Fechas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="fecha_inicio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Inicio *</FormLabel>
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

                            <FormField
                                control={form.control}
                                name="fecha_fin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Fin *</FormLabel>
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

                        {/* Información de período */}
                        {diasAusencia > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4" />
                                        Información del Período
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Duración:</span>
                                            <Badge variant="outline">
                                                {diasAusencia} {diasAusencia === 1 ? 'día' : 'días'}
                                            </Badge>
                                        </div>
                                        {estaActiva && (
                                            <Badge variant="default">
                                                Ausencia inmediata
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Motivo */}
                        <FormField
                            control={form.control}
                            name="motivo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Motivo (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Motivo de la ausencia"
                                            {...field}
                                            maxLength={60}
                                        />
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
                                    <FormLabel>Descripción (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detalles adicionales sobre la ausencia..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                            maxLength={255}
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

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                <Send className="mr-2 h-4 w-4" />
                                {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}