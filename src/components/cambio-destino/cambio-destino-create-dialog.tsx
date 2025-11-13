'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useCambioDestinoStore } from '@/store/cambio-destino.store';
import { useCreateCambioDestino, useFuncionariosBasic, useUnidadesBasic } from '@/hooks/cambio-destino.queries';
import { ComboboxFuncionarios } from './combobox-funcionarios';
import { ComboboxUnidades } from './combobox-unidades';

const createCambioDestinoSchema = z.object({
  funcionario_id: z.number({
    message: 'Debe seleccionar un funcionario',
  }),
  unidad_destino_id: z.number({
    message: 'Debe seleccionar una unidad de destino',
  }),
  destino_anterior_id: z.number().optional().nullable(),
  fecha_destino: z.string({
    message: 'La fecha de destino es requerida',
  }).min(1, 'La fecha de destino es requerida'),
  motivo_cambio: z.string({
    message: 'El motivo del cambio es requerido',
  })
    .min(1, 'El motivo del cambio es requerido')
    .max(500, 'El motivo no puede exceder 500 caracteres'),
  activo: z.boolean().default(true),
});

type CreateCambioDestinoFormValues = z.input<typeof createCambioDestinoSchema>;

export function CambioDestinoCreateDialog() {
  const { isCreateDialogOpen, closeCreateDialog } = useCambioDestinoStore();
  const { mutate: createCambioDestino, isPending } = useCreateCambioDestino();
  const { data: funcionarios = [], isLoading: loadingFuncionarios } = useFuncionariosBasic();
  const { data: unidades = [], isLoading: loadingUnidades } = useUnidadesBasic();

  const [funcionarioOpen, setFuncionarioOpen] = useState(false);
  const [unidadDestinoOpen, setUnidadDestinoOpen] = useState(false);
  const [unidadAnteriorOpen, setUnidadAnteriorOpen] = useState(false);

  const form = useForm<CreateCambioDestinoFormValues>({
    resolver: zodResolver(createCambioDestinoSchema),
    defaultValues: {
      funcionario_id: undefined,
      unidad_destino_id: undefined,
      destino_anterior_id: undefined,
      fecha_destino: '',
      motivo_cambio: '',
      activo: true,
    },
  });

  const onSubmit = (values: CreateCambioDestinoFormValues) => {
    const submitData = {
      ...values,
      destino_anterior_id: values.destino_anterior_id || null,
    };

    createCambioDestino(submitData, {
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

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={handleClose}>
      {/* CAMBIO 1: Se modifica el DialogContent para usar Flexbox y limitar su altura */}
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[95vh]">
        <DialogHeader>
          <DialogTitle>Crear Cambio de Destino</DialogTitle>
          <DialogDescription>
            Registre un nuevo cambio de destino para un funcionario. Complete todos los campos requeridos.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          {/* CAMBIO 2: El formulario ocupará el espacio disponible y contendrá el área de scroll y el footer */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow overflow-hidden">
            {/* CAMBIO 3: Esta nueva div es el área que tendrá scroll. Ocupa el espacio sobrante y lo que no cabe, se desplaza */}
            <div className="flex-grow overflow-y-auto pr-4 space-y-6">
              {/* Contenedor de grilla unificado para los campos superiores */}
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
                          loading={loadingFuncionarios}
                          placeholder="Seleccionar funcionario..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Unidad de Destino */}
                <FormField
                  control={form.control}
                  name="unidad_destino_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Unidad de Destino *</FormLabel>
                      <FormControl>
                        <ComboboxUnidades
                          unidades={unidades}
                          value={field.value}
                          onChange={field.onChange}
                          open={unidadDestinoOpen}
                          setOpen={setUnidadDestinoOpen}
                          loading={loadingUnidades}
                          placeholder="Seleccionar unidad de destino..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Unidad Anterior */}
                <FormField
                  control={form.control}
                  name="destino_anterior_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Unidad Anterior (Opcional)</FormLabel>
                      <FormControl>
                        <ComboboxUnidades
                          unidades={unidades}
                          value={field.value ?? undefined}
                          onChange={field.onChange}
                          open={unidadAnteriorOpen}
                          setOpen={setUnidadAnteriorOpen}
                          loading={loadingUnidades}
                          placeholder="Seleccionar unidad anterior..."
                          allowClear
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fecha de Destino */}
                <FormField
                  control={form.control}
                  name="fecha_destino"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Destino *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="Seleccionar fecha"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Motivo del Cambio */}
              <FormField
                control={form.control}
                name="motivo_cambio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo del Cambio *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describa el motivo del cambio de destino..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado Activo */}
              <FormField
                control={form.control}
                name="activo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Estado Activo</FormLabel>
                      <div className="text-[0.8rem] text-muted-foreground">
                        Marque si el cambio de destino está activo
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
            </div>

            {/* CAMBIO 4: El footer ahora está fuera del área de scroll, pero dentro del form, para que el submit funcione */}
            <DialogFooter className="pt-4 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Cambio de Destino
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}