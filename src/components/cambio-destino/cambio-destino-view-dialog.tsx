'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    User,
    Building2,
    Calendar,
    FileText,
    Clock,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCambioDestinoStore } from '@/store/cambio-destino.store';

export function CambioDestinoViewDialog() {
    const { isViewDialogOpen, closeViewDialog, selectedCambioDestino } = useCambioDestinoStore();

    if (!selectedCambioDestino) return null;

    return (
        <Dialog open={isViewDialogOpen} onOpenChange={closeViewDialog}>
            <DialogContent className="max-w-[95vw] sm:max-w-[600px] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-start gap-2 text-lg sm:text-xl flex-wrap">
                        <FileText className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span>Detalles del Cambio de Destino</span>
                    </DialogTitle>
                    <DialogDescription className="text-sm mt-1">
                        Información completa del cambio de destino seleccionado.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* Estado del registro */}
                    <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={selectedCambioDestino.activo ? 'default' : 'secondary'} className="whitespace-nowrap">
                                {selectedCambioDestino.activo ? (
                                    <>
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                        Activo
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="mr-1 h-3 w-3" />
                                        Inactivo
                                    </>
                                )}
                            </Badge>
                            {selectedCambioDestino.deleted_at && (
                                <Badge variant="destructive" className="whitespace-nowrap">
                                    Eliminado
                                </Badge>
                            )}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                            ID: {selectedCambioDestino.id}
                        </div>
                    </div>

                    <Separator />

                    {/* Información del funcionario */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 font-medium text-sm sm:text-base">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span>Funcionario</span>
                        </div>
                        <div className="pl-6 space-y-2">
                            <div>
                                <span className="text-xs sm:text-sm font-medium">Nombre completo:</span>
                                <div className="text-xs sm:text-sm text-muted-foreground break-words hyphens-auto">
                                    {selectedCambioDestino.funcionario.nombre_completo}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs sm:text-sm font-medium">Número de carnet:</span>
                                <div className="text-xs sm:text-sm text-muted-foreground break-all">
                                    {selectedCambioDestino.funcionario.numero_carnet}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Información de las unidades */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 font-medium text-sm sm:text-base">
                            <Building2 className="h-4 w-4 flex-shrink-0" />
                            <span>Unidades</span>
                        </div>
                        <div className="pl-6 space-y-3">
                            <div>
                                <span className="text-xs sm:text-sm font-medium">Unidad de destino:</span>
                                <div className="text-xs sm:text-sm text-muted-foreground break-words hyphens-auto">
                                    {selectedCambioDestino.unidad_destino.nombre_unidad}
                                </div>
                            </div>
                            {selectedCambioDestino.unidad_anterior && (
                                <div>
                                    <span className="text-xs sm:text-sm font-medium">Unidad anterior:</span>
                                    <div className="text-xs sm:text-sm text-muted-foreground break-words hyphens-auto">
                                        {selectedCambioDestino.unidad_anterior.nombre_unidad}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Información del cambio */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 font-medium text-sm sm:text-base">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>Detalles del Cambio</span>
                        </div>
                        <div className="pl-6 space-y-3">
                            <div>
                                <span className="text-xs sm:text-sm font-medium">Fecha de destino:</span>
                                <div className="text-xs sm:text-sm text-muted-foreground break-words">
                                    {format(new Date(selectedCambioDestino.fecha_destino + 'T00:00:00'), 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: es })}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs sm:text-sm font-medium">Motivo del cambio:</span>
                                <div className="text-xs sm:text-sm text-muted-foreground mt-1 p-2 sm:p-3 bg-muted rounded-lg break-words hyphens-auto">
                                    {selectedCambioDestino.motivo_cambio}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Metadatos */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 font-medium text-sm sm:text-base">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>Información del Sistema</span>
                        </div>
                        <div className="pl-6 space-y-2">
                            <div className="flex flex-wrap justify-between gap-1 text-xs sm:text-sm min-w-0">
                                <span className="font-medium truncate">Creado:</span>
                                <span className="text-muted-foreground text-right flex-shrink-0">
                                    {format(new Date(selectedCambioDestino.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                </span>
                            </div>
                            <div className="flex flex-wrap justify-between gap-1 text-xs sm:text-sm min-w-0">
                                <span className="font-medium truncate">Actualizado:</span>
                                <span className="text-muted-foreground text-right flex-shrink-0">
                                    {format(new Date(selectedCambioDestino.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                </span>
                            </div>
                            {selectedCambioDestino.deleted_at && (
                                <div className="flex flex-wrap justify-between gap-1 text-xs sm:text-sm min-w-0">
                                    <span className="font-medium truncate">Eliminado:</span>
                                    <span className="text-destructive text-right flex-shrink-0">
                                        {format(new Date(selectedCambioDestino.deleted_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}