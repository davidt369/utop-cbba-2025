"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateDatosFuncionario, type UpdateDatosFuncionarioData, type MiPerfil } from '@/hooks/mi-perfil.queries';

// Opciones para los selects (copiadas de funcionario-edit-dialog)
const EXPEDIDO_OPTIONS = [
  { value: "LP", label: "La Paz" },
  { value: "OR", label: "Oruro" },
  { value: "PT", label: "Potosí" },
  { value: "CB", label: "Cochabamba" },
  { value: "CH", label: "Chuquisaca" },
  { value: "TJ", label: "Tarija" },
  { value: "SC", label: "Santa Cruz" },
  { value: "BE", label: "Beni" },
  { value: "PA", label: "Pando" },
];

const SEXO_OPTIONS = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
];

const GRADO_JERARQUICO_OPTIONS = [
  { value: "Coronel", label: "Coronel" },
  { value: "Teniente coronel", label: "Teniente Coronel" },
  { value: "Mayor", label: "Mayor" },
  { value: "Capitán", label: "Capitán" },
  { value: "Teniente", label: "Teniente" },
  { value: "Sub teniente", label: "Sub Teniente" },
  { value: "Sub oficial superior", label: "Sub Oficial Superior" },
  { value: "Sub oficial primero", label: "Sub Oficial Primero" },
  { value: "Sub oficial segundo", label: "Sub Oficial Segundo" },
  { value: "Sargento mayor", label: "Sargento Mayor" },
  { value: "Sargento primero", label: "Sargento Primero" },
  { value: "Sargento segundo", label: "Sargento Segundo" },
  { value: "Sargento inicial", label: "Sargento Inicial" },
];

const ESTADO_FUNCIONARIO_OPTIONS = [
  { value: "Activo", label: "Activo" },
  { value: "Suspendido", label: "Suspendido" },
  { value: "Baja medica", label: "Baja Médica" },
  { value: "De Vacaciones", label: "De Vacaciones" },
  { value: "En permiso", label: "En Permiso" },
  { value: "Baja Definitiva", label: "Baja Definitiva" },
];

interface EditDatosFuncionarioDialogProps {
  isOpen: boolean;
  onClose: () => void;
  funcionario: MiPerfil;
}

// Define schema including all funcionario fields
const datosFuncionarioSchema = z.object({
  primer_nombre: z.string().min(1, "El primer nombre es obligatorio"),
  segundo_nombre: z.string().optional(),
  primer_apellido: z.string().min(1, "El primer apellido es obligatorio"),
  segundo_apellido: z.string().optional(),
  numero_carnet: z.string().optional(),
  expedido: z.string().min(1, "El lugar de expedición es obligatorio"),
  sexo: z.string().min(1, "El sexo es obligatorio"),
  grado_jerarquico: z.string().min(1, "El grado jerárquico es obligatorio"),
  direccion: z.string().optional(),
  numero_celular: z.string().optional(),
  numero_escalafon: z.string().optional(),
  numero_cuenta_bancaria: z.string().optional(),
});

type DatosFuncionarioForm = z.infer<typeof datosFuncionarioSchema>;

export function EditDatosFuncionarioDialog({ isOpen, onClose, funcionario }: EditDatosFuncionarioDialogProps) {
  const updateDatos = useUpdateDatosFuncionario();
  const form = useForm<DatosFuncionarioForm>({
    resolver: zodResolver(datosFuncionarioSchema),
    defaultValues: {
      primer_nombre: funcionario.primer_nombre,
      segundo_nombre: funcionario.segundo_nombre || '',
      primer_apellido: funcionario.primer_apellido,
      segundo_apellido: funcionario.segundo_apellido || '',
      numero_carnet: funcionario.numero_carnet || '',
      expedido: funcionario.expedido || 'LP', // Valor por defecto
      sexo: funcionario.sexo || 'M', // Valor por defecto
      grado_jerarquico: funcionario.grado_jerarquico || 'Sargento inicial', // Valor por defecto
      direccion: funcionario.direccion || '',
      numero_celular: funcionario.numero_celular || '',
      numero_escalafon: funcionario.numero_escalafon || '',
      numero_cuenta_bancaria: funcionario.numero_cuenta_bancaria || '',
      // estado_funcionario: funcionario.estado_funcionario || 'Activo', // No editable
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        primer_nombre: funcionario.primer_nombre,
        segundo_nombre: funcionario.segundo_nombre || '',
        primer_apellido: funcionario.primer_apellido,
        segundo_apellido: funcionario.segundo_apellido || '',
        numero_carnet: funcionario.numero_carnet || '',
        expedido: funcionario.expedido || 'LP',
        sexo: funcionario.sexo || 'M',
        grado_jerarquico: funcionario.grado_jerarquico || 'Sargento inicial',
        direccion: funcionario.direccion || '',
        numero_celular: funcionario.numero_celular || '',
        numero_escalafon: funcionario.numero_escalafon || '',
        numero_cuenta_bancaria: funcionario.numero_cuenta_bancaria || '',
        // estado_funcionario: funcionario.estado_funcionario || 'Activo',
      });
    }
  }, [isOpen]);


  const onSubmit = (data: DatosFuncionarioForm) => {
    updateDatos.mutate(data, { onSuccess: onClose });
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-1">
          <DialogTitle>Editar Mis Datos Personales</DialogTitle>
          <DialogDescription>
            Actualiza tu información personal de contacto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 px-1">
          {/* Nombres */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="primer_nombre">Primer Nombre</Label>
              <Input
                id="primer_nombre"
                {...form.register('primer_nombre')}
                className="w-full"
              />
              {form.formState.errors.primer_nombre && (
                <p className="text-sm text-red-600">El primer nombre es obligatorio</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="segundo_nombre">Segundo Nombre</Label>
              <Input
                id="segundo_nombre"
                {...form.register('segundo_nombre')}
                className="w-full"
              />
            </div>
          </div>

          {/* Apellidos */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="primer_apellido">Primer Apellido</Label>
              <Input
                id="primer_apellido"
                {...form.register('primer_apellido')}
                className="w-full"
              />
              {form.formState.errors.primer_apellido && (
                <p className="text-sm text-red-600">El primer apellido es obligatorio</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="segundo_apellido">Segundo Apellido</Label>
              <Input
                id="segundo_apellido"
                {...form.register('segundo_apellido')}
                className="w-full"
              />
            </div>
          </div>

          {/* Carnet y Expedición */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_carnet">Número de Carnet</Label>
              <Input
                id="numero_carnet"
                {...form.register('numero_carnet')}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expedido">Expedido</Label>
              <Select
                value={form.watch("expedido")}
                onValueChange={(value) => form.setValue("expedido", value)}
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
              {form.formState.errors.expedido && (
                <p className="text-sm text-red-600">Debe seleccionar lugar de expedición</p>
              )}
            </div>
          </div>

          {/* Sexo y Grado Jerárquico */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Select
                value={form.watch("sexo")}
                onValueChange={(value) => form.setValue("sexo", value)}
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
              {form.formState.errors.sexo && (
                <p className="text-sm text-red-600">Debe seleccionar el sexo</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="grado_jerarquico">Grado Jerárquico</Label>
              <Select
                value={form.watch("grado_jerarquico")}
                onValueChange={(value) => form.setValue("grado_jerarquico", value)}
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
              {form.formState.errors.grado_jerarquico && (
                <p className="text-sm text-red-600">Debe seleccionar el grado jerárquico</p>
              )}
            </div>
          </div>

          {/* Estado Funcionario (solo visual) */}
          <div className="space-y-2">
            <Label>Estado del Funcionario</Label>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">{funcionario.estado_funcionario || 'Activo'}</p>
              <p className="text-xs text-muted-foreground">
                El estado del funcionario no puede ser modificado desde este formulario
              </p>
            </div>
          </div>

          {/* Escalafón y Celular */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_escalafon">Número de Escalafón</Label>
              <Input
                id="numero_escalafon"
                {...form.register('numero_escalafon')}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero_celular">Número de Celular</Label>
              <Input
                id="numero_celular"
                placeholder="Ingresa tu número de celular"
                {...form.register('numero_celular')}
                className="w-full"
              />
              {form.formState.errors.numero_celular && (
                <p className="text-sm text-red-600">{form.formState.errors.numero_celular.message}</p>
              )}
            </div>
          </div>

          {/* Dirección y Cuenta Bancaria */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                placeholder="Ingresa tu dirección"
                {...form.register('direccion')}
                className="w-full"
              />
              {form.formState.errors.direccion && (
                <p className="text-sm text-red-600">{form.formState.errors.direccion.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero_cuenta_bancaria">Número de Cuenta Bancaria</Label>
              <Input
                id="numero_cuenta_bancaria"
                placeholder="Ingresa tu número de cuenta bancaria"
                {...form.register('numero_cuenta_bancaria')}
                className="w-full"
              />
              {form.formState.errors.numero_cuenta_bancaria && (
                <p className="text-sm text-red-600">{form.formState.errors.numero_cuenta_bancaria.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateDatos.isPending}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateDatos.isPending}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {updateDatos.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}