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
import { useUpdateEmail, type UpdateEmailData, type MiPerfil } from '@/hooks/mi-perfil.queries';

interface EditEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  funcionario: MiPerfil;
}

export function EditEmailDialog({ isOpen, onClose, funcionario }: EditEmailDialogProps) {
  const updateEmail = useUpdateEmail();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateEmailData>({
    defaultValues: {
      email: funcionario.usuario.email,
      password: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        email: funcionario.usuario.email,
        password: '',
      });
    }
  }, [isOpen, funcionario, reset]);

  const onSubmit = (data: UpdateEmailData) => {
    updateEmail.mutate(data, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Cambiar Email</DialogTitle>
          <DialogDescription>
            Actualiza tu dirección de correo electrónico
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Nuevo Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nuevo@email.com"
              {...register('email', {
                required: 'El email es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                },
                maxLength: {
                  value: 50,
                  message: 'El email no puede exceder 50 caracteres'
                }
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña Actual</Label>
            <Input
              id="password"
              type="password"
              placeholder="Confirma tu contraseña actual"
              {...register('password', {
                required: 'La contraseña actual es requerida',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres'
                }
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateEmail.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateEmail.isPending}
            >
              {updateEmail.isPending ? 'Actualizando...' : 'Actualizar Email'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}