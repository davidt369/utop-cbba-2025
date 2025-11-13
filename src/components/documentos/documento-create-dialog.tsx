"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useDocumentoStore } from "@/store/documento.store";
import {
  useCreateDocumento,
  useFuncionariosParaDocumento,
  useTiposDisponibles
} from "@/hooks/documento.queries";
import { FileDropzone } from "./file-dropzone";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { TipoDocumento } from "@/types/documento.types";

const createDocumentoSchema = z.object({
  tipo_documento: z.string().min(1, "Selecciona un tipo de documento"),
  funcionario_id: z.number().min(1, "Selecciona un funcionario"),
  archivo: z.instanceof(File, { message: "Selecciona un archivo" }),
  aprobado: z.boolean(),
});

type CreateDocumentoFormData = z.infer<typeof createDocumentoSchema>;

export function DocumentoCreateDialog() {
  const { isCreateDialogOpen, closeCreateDialog } = useDocumentoStore();
  const [funcionarioSelectOpen, setFuncionarioSelectOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: funcionarios = [], isLoading: isLoadingFuncionarios } = useFuncionariosParaDocumento();
  const createDocumento = useCreateDocumento();

  const form = useForm<CreateDocumentoFormData>({
    resolver: zodResolver(createDocumentoSchema),
    defaultValues: {
      tipo_documento: "",
      funcionario_id: 0,
      archivo: undefined as any,
      aprobado: false,
    },
  });

  const funcionarioId = form.watch("funcionario_id");
  const { data: tiposDisponibles = [] } = useTiposDisponibles(funcionarioId || null);

  const onSubmit = async (data: CreateDocumentoFormData) => {
    try {
      await createDocumento.mutateAsync({
        tipo_documento: data.tipo_documento as TipoDocumento,
        funcionario_id: data.funcionario_id,
        archivo: data.archivo,
        aprobado: data.aprobado,
      });

      toast.success("Documento creado correctamente");
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Error al crear documento");
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedFile(null);
    closeCreateDialog();
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    form.setValue("archivo", file);
    form.clearErrors("archivo");
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    form.setValue("archivo", undefined as any);
  };

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Documento</DialogTitle>
          <DialogDescription>
            Sube un documento para un funcionario. Cada funcionario puede tener máximo 6 tipos de documentos.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Funcionario */}
            <FormField
              control={form.control}
              name="funcionario_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Funcionario</FormLabel>
                  <Popover open={funcionarioSelectOpen} onOpenChange={setFuncionarioSelectOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={funcionarioSelectOpen}
                          className="justify-between"
                          disabled={isLoadingFuncionarios}
                        >
                          {field.value
                            ? funcionarios.find((funcionario) => funcionario.id === field.value)?.nombre_completo
                            : "Selecciona un funcionario..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar funcionario..." />
                        <CommandList>
                          <CommandEmpty>No se encontraron funcionarios.</CommandEmpty>
                          <CommandGroup>
                            {funcionarios.map((funcionario) => (
                              <CommandItem
                                key={funcionario.id}
                                value={funcionario.nombre_completo}
                                onSelect={() => {
                                  form.setValue("funcionario_id", funcionario.id);
                                  form.setValue("tipo_documento", ""); // Reset tipo when changing funcionario
                                  setFuncionarioSelectOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    funcionario.id === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {funcionario.nombre_completo}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de Documento */}
            <FormField
              control={form.control}
              name="tipo_documento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!funcionarioId || tiposDisponibles.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo de documento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposDisponibles.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {!funcionarioId && "Primero selecciona un funcionario"}
                    {funcionarioId && tiposDisponibles.length === 0 && "Este funcionario ya tiene todos los tipos de documentos"}
                    {funcionarioId && tiposDisponibles.length > 0 && `Tipos disponibles: ${tiposDisponibles.length}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Archivo */}
            <FormField
              control={form.control}
              name="archivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Archivo</FormLabel>
                  <FormControl>
                    <FileDropzone
                      onFileSelect={handleFileSelect}
                      onFileRemove={handleFileRemove}
                      selectedFile={selectedFile}
                      disabled={createDocumento.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Aprobado */}
            <FormField
              control={form.control}
              name="aprobado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Documento aprobado</FormLabel>
                    <FormDescription>
                      Marca esta opción si el documento ya está aprobado
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createDocumento.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createDocumento.isPending}
              >
                {createDocumento.isPending ? "Creando..." : "Crear Documento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}