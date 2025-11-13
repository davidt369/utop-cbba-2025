'use client';

import { Check, ChevronsUpDown, User, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import type { FuncionarioBasic } from '@/types/ausencia.types';

interface ComboboxFuncionariosProps {
    funcionarios: FuncionarioBasic[];
    value?: number;
    onChange: (value: number | undefined) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    loading?: boolean;
    placeholder?: string;
    allowClear?: boolean;
    showRestrictedFuncionarios?: boolean; // Mostrar funcionarios no disponibles con indicadores
}

export function ComboboxFuncionarios({
    funcionarios,
    value,
    onChange,
    open,
    setOpen,
    loading = false,
    placeholder = 'Seleccionar funcionario...',
    allowClear = false,
    showRestrictedFuncionarios = true,
}: ComboboxFuncionariosProps) {
    const selectedFuncionario = funcionarios.find((f) => f.id === value);

    // Debug temporal
    // console.log('🔍 ComboboxFuncionarios - value:', value, typeof value);
    // console.log('🔍 ComboboxFuncionarios - funcionarios.length:', funcionarios.length);
    // console.log('🔍 ComboboxFuncionarios - selectedFuncionario:', selectedFuncionario);

    const handleSelect = (selectedValue: string) => {
        if (selectedValue === 'clear' && allowClear) {
            onChange(undefined);
        } else {
            const selectedId = parseInt(selectedValue);
            const selectedFuncionario = funcionarios.find(f => f.id === selectedId);

            // Solo permitir selección si el funcionario puede tener ausencia o si showRestrictedFuncionarios es false
            if (!showRestrictedFuncionarios || selectedFuncionario?.puede_tener_ausencia !== false) {
                onChange(selectedId);
            }
        }
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between text-left font-normal"
                    disabled={loading}
                >
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Cargando...
                            </span>
                        ) : selectedFuncionario ? (
                            <div className="flex flex-col">
                                <span className="font-medium">{selectedFuncionario.nombre_completo}</span>
                                <span className="text-xs text-muted-foreground">
                                    C.I. {selectedFuncionario.numero_carnet}
                                </span>
                            </div>
                        ) : (
                            placeholder
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar funcionario por nombre o C.I..." />
                    <CommandList>
                        <CommandEmpty>
                            {loading ? 'Cargando funcionarios...' : 'No se encontraron funcionarios.'}
                        </CommandEmpty>
                        <CommandGroup>
                            {allowClear && value && (
                                <CommandItem value="clear" onSelect={handleSelect}>
                                    <span className="text-muted-foreground italic">Limpiar selección</span>
                                </CommandItem>
                            )}
                            {funcionarios.map((funcionario) => {
                                const esDisponible = funcionario.puede_tener_ausencia !== false;
                                const tienerestricciones = funcionario.razon_restriccion;

                                return (
                                    <CommandItem
                                        key={funcionario.id}
                                        value={`${funcionario.id} ${funcionario.nombre_completo} ${funcionario.numero_carnet}`}
                                        onSelect={() => handleSelect(funcionario.id.toString())}
                                        disabled={showRestrictedFuncionarios && !esDisponible}
                                        className={cn(
                                            showRestrictedFuncionarios && !esDisponible && "opacity-60 cursor-not-allowed"
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                value === funcionario.id ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className="flex flex-col gap-1 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "font-medium",
                                                        showRestrictedFuncionarios && !esDisponible && "text-muted-foreground"
                                                    )}>
                                                        {funcionario.nombre_completo}
                                                    </span>
                                                    {showRestrictedFuncionarios && (
                                                        esDisponible ? (
                                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                                                        )
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    C.I. {funcionario.numero_carnet}
                                                    {funcionario.estado_funcionario && ` • ${funcionario.estado_funcionario}`}
                                                </div>
                                                {showRestrictedFuncionarios && tienerestricciones && (
                                                    <div className="text-xs text-orange-600 font-medium">
                                                        ⚠️ {tienerestricciones}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}