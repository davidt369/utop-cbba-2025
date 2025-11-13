"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
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
import { useUpdatePassword, type UpdatePasswordData } from '@/hooks/mi-perfil.queries';

interface EditPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditPasswordDialog({ isOpen, onClose }: EditPasswordDialogProps) {
  const updatePassword = useUpdatePassword();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UpdatePasswordData>({
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  });

  const newPassword = watch('new_password');

  React.useEffect(() => {
    if (isOpen) {
      reset({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    }
  }, [isOpen, reset]);

  const onSubmit = (data: UpdatePasswordData) => {
    updatePassword.mutate(data, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Cambiar Contraseña</DialogTitle>
          <DialogDescription>
            Actualiza tu contraseña de acceso al sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Contraseña Actual</Label>
            <Input
              id="current_password"
              type="password"
              placeholder="Ingresa tu contraseña actual"
              {...register('current_password', {
                required: 'La contraseña actual es requerida',
              })}
            />
            {errors.current_password && (
              <p className="text-sm text-red-600">{errors.current_password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">Nueva Contraseña</Label>
            <Input
              id="new_password"
              type="password"
              placeholder="Ingresa tu nueva contraseña"
              {...register('new_password', {
                required: 'La nueva contraseña es requerida',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres'
                }
              })}
            />
            {errors.new_password && (
              <p className="text-sm text-red-600">{errors.new_password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password_confirmation">Confirmar Nueva Contraseña</Label>
            <Input
              id="new_password_confirmation"
              type="password"
              placeholder="Confirma tu nueva contraseña"
              {...register('new_password_confirmation', {
                required: 'La confirmación de contraseña es requerida',
                validate: (value) => {
                  if (value !== newPassword) {
                    return 'Las contraseñas no coinciden';
                  }
                }
              })}
            />
            {errors.new_password_confirmation && (
              <p className="text-sm text-red-600">{errors.new_password_confirmation.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updatePassword.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updatePassword.isPending}
            >
              {updatePassword.isPending ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}