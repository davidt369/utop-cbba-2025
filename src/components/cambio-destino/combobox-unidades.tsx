'use client';

import { Check, ChevronsUpDown, Building2, Loader2 } from 'lucide-react';
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
import type { UnidadBasic } from '@/types/cambio-destino.types';

interface ComboboxUnidadesProps {
  unidades: UnidadBasic[];
  value?: number;
  onChange: (value: number | undefined) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  loading?: boolean;
  placeholder?: string;
  allowClear?: boolean;
}

export function ComboboxUnidades({
  unidades,
  value,
  onChange,
  open,
  setOpen,
  loading = false,
  placeholder = 'Seleccionar unidad...',
  allowClear = false,
}: ComboboxUnidadesProps) {
  const selectedUnidad = unidades.find((u) => u.id === value);

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === 'clear' && allowClear) {
      onChange(undefined);
    } else {
      const selectedId = parseInt(selectedValue);
      onChange(selectedId === value ? undefined : selectedId);
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
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando...
              </span>
            ) : selectedUnidad ? (
              selectedUnidad.nombre_unidad
            ) : (
              placeholder
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar unidad..." />
          <CommandList>
            <CommandEmpty>
              {loading ? 'Cargando unidades...' : 'No se encontraron unidades.'}
            </CommandEmpty>
            <CommandGroup>
              {allowClear && value && (
                <CommandItem value="clear" onSelect={handleSelect}>
                  <span className="text-muted-foreground italic">Limpiar selección</span>
                </CommandItem>
              )}
              {unidades.map((unidad) => (
                <CommandItem
                  key={unidad.id}
                  value={unidad.id.toString()}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === unidad.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  {unidad.nombre_unidad}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}