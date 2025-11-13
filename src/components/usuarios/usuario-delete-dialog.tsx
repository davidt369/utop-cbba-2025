'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useUsuariosStore } from '@/store/usuarios.store';
import { useDeleteUsuario } from '@/hooks/usuarios.queries';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

export function UsuarioDeleteDialog() {
    const {
        isDeleteDialogOpen,
        setDeleteDialogOpen,
        selectedUsuario,
        closeAllDialogs
    } = useUsuariosStore();
    const deleteUsuario = useDeleteUsuario();

    const handleDelete = async () => {
        if (!selectedUsuario) return;

        try {
            await deleteUsuario.mutateAsync(selectedUsuario.id);
            toast.success('Usuario eliminado exitosamente');
            closeAllDialogs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al eliminar el usuario');
        }
    };

    const handleClose = () => {
        setDeleteDialogOpen(false);
    };

    if (!selectedUsuario) return null;

    return (
        <Dialog open={isDeleteDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Confirmar Eliminación
                    </DialogTitle>
                    <DialogDescription>
                        Esta acción no se puede deshacer. El usuario será eliminado permanentemente.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <div className="text-sm">
                            <p className="font-medium text-red-800">
                                ¿Estás seguro de que deseas eliminar este usuario?
                            </p>
                            <div className="mt-2 space-y-1 text-red-700">
                                <p><span className="font-medium">Email:</span> {selectedUsuario.email}</p>
                                <p><span className="font-medium">Rol:</span> {selectedUsuario.rol?.nombre_rol}</p>
                                <p><span className="font-medium">ID:</span> {selectedUsuario.id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={deleteUsuario.isPending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteUsuario.isPending}
                    >
                        {deleteUsuario.isPending ? 'Eliminando...' : 'Eliminar Usuario'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}