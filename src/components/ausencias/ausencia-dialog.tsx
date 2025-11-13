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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AusenciaFormData, TIPOS_AUSENCIA } from '@/types/ausencia.types';
import { useCreateAusencia, useUpdateAusencia, useFuncionariosBasic } from '@/hooks/ausencias.queries';
import useAusenciaStore from '@/store/ausencias.store';
import { ComboboxFuncionarios } from './combobox-funcionarios';

const ausenciaSchema = z.object({
  tipo_ausencia: z.enum(['Permiso', 'Baja Médica', 'Vacaciones'], { message: 'Selecciona un tipo de ausencia' }),
  motivo: z.string().max(60, 'El motivo no puede exceder 60 caracteres').optional(),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
  fecha_fin: z.string().min(1, 'La fecha de fin es obligatoria'),
  descripcion: z.string().max(255, 'La descripción no puede exceder 255 caracteres').optional(),
  aprobado: z.boolean(),
  activo: z.boolean(),
  funcionario_id: z.number({ message: 'Selecciona un funcionario' }).min(1, 'Selecciona un funcionario'),
}).refine((data) => {
  if (data.fecha_inicio && data.fecha_fin) {
    return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
  path: ['fecha_fin'],
});

type AusenciaFormValues = z.infer<typeof ausenciaSchema>;

export default function AusenciaDialog() {
  const {
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedAusencia,
    closeCreateDialog,
    closeEditDialog,
  } = useAusenciaStore();

  const { data: funcionarios = [], isLoading: isLoadingFuncionarios } = useFuncionariosBasic();
  const createMutation = useCreateAusencia();
  const updateMutation = useUpdateAusencia();

  const [funcionarioOpen, setFuncionarioOpen] = useState(false);

  const isOpen = isCreateDialogOpen || isEditDialogOpen;
  const isEditing = isEditDialogOpen && selectedAusencia;

  const form = useForm<AusenciaFormValues>({
    resolver: zodResolver(ausenciaSchema),
    defaultValues: {
      tipo_ausencia: 'Permiso',
      motivo: '',
      fecha_inicio: '',
      fecha_fin: '',
      descripcion: '',
      aprobado: false,
      activo: true,
      funcionario_id: undefined,
    },
  });

  // Rellenar formulario cuando se edita
  useEffect(() => {
    if (isEditing && selectedAusencia) {
      form.reset({
        tipo_ausencia: selectedAusencia.tipo_ausencia,
        motivo: selectedAusencia.motivo || '',
        fecha_inicio: selectedAusencia.fecha_inicio,
        fecha_fin: selectedAusencia.fecha_fin,
        descripcion: selectedAusencia.descripcion || '',
        aprobado: selectedAusencia.aprobado,
        activo: selectedAusencia.activo,
        funcionario_id: selectedAusencia.funcionario_id,
      });
    } else {
      form.reset({
        tipo_ausencia: 'Permiso',
        motivo: '',
        fecha_inicio: '',
        fecha_fin: '',
        descripcion: '',
        aprobado: false,
        activo: true,
        funcionario_id: undefined,
      });
    }
  }, [isEditing, selectedAusencia, form]);

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

  const onSubmit = async (data: AusenciaFormValues) => {
    try {
      const formData: AusenciaFormData = {
        ...data,
        motivo: data.motivo || undefined,
        descripcion: data.descripcion || undefined,
      };

      if (isEditing && selectedAusencia) {
        await updateMutation.mutateAsync({
          id: selectedAusencia.id,
          data: formData,
        });
        closeEditDialog();
      } else {
        await createMutation.mutateAsync(formData);
        closeCreateDialog();
      }

      form.reset();
    } catch (error) {
      console.error('Error al guardar ausencia:', error);
    }
  };

  const handleClose = () => {
    if (isCreateDialogOpen) {
      closeCreateDialog();
    } else {
      closeEditDialog();
    }
    form.reset();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Ausencia' : 'Nueva Ausencia'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos de la ausencia.'
              : 'Completa la información para crear una nueva ausencia.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            {/* Fechas en una fila */}
            <div className="grid grid-cols-2 gap-4">
              {/* Fecha Inicio */}
              <FormField
                control={form.control}
                name="fecha_inicio"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha Inicio *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'PPP', { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) =>
                            field.onChange(date?.toISOString().split('T')[0])
                          }
                          disabled={(date) =>
                            date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fecha Fin */}
              <FormField
                control={form.control}
                name="fecha_fin"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha Fin *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'PPP', { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) =>
                            field.onChange(date?.toISOString().split('T')[0])
                          }
                          disabled={(date) => {
                            const fechaInicio = form.getValues('fecha_inicio');
                            return fechaInicio
                              ? date < new Date(fechaInicio)
                              : date < new Date('1900-01-01');
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                      placeholder="Descripción adicional"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estados en una fila */}
            <div className="grid grid-cols-2 gap-4">
              {/* Aprobado */}
              <FormField
                control={form.control}
                name="aprobado"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Aprobado</FormLabel>
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

              {/* Activo */}
              <FormField
                control={form.control}
                name="activo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Activo</FormLabel>
                      <div className="text-xs text-muted-foreground">
                        {field.value ? 'Dentro del período' : 'Fuera del período'}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
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
                {isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}