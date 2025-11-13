"use client";

import React, { useState, useEffect } from "react";
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
  useUpdateDocumento, 
  useFuncionariosParaDocumento 
} from "@/hooks/documento.queries";
import { FileDropzone } from "./file-dropzone";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { TipoDocumento } from "@/types/documento.types";
import { TIPOS_DOCUMENTO } from "@/types/documento.types";

const updateDocumentoSchema = z.object({
  tipo_documento: z.string().optional(),
  funcionario_id: z.number().optional(),
  archivo: z.instanceof(File).optional(),
  aprobado: z.boolean(),
});

type UpdateDocumentoFormData = z.infer<typeof updateDocumentoSchema>;

export function DocumentoEditDialog() {
  const { isEditDialogOpen, closeEditDialog, selectedDocumento } = useDocumentoStore();
  const [funcionarioSelectOpen, setFuncionarioSelectOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: funcionarios = [], isLoading: isLoadingFuncionarios } = useFuncionariosParaDocumento();
  const updateDocumento = useUpdateDocumento();

  const form = useForm<UpdateDocumentoFormData>({
    resolver: zodResolver(updateDocumentoSchema),
    defaultValues: {
      tipo_documento: "",
      funcionario_id: 0,
      archivo: undefined,
      aprobado: false,
    },
  });

  // Actualizar el form cuando cambie el documento seleccionado
  useEffect(() => {
    if (selectedDocumento) {
      form.reset({
        tipo_documento: selectedDocumento.tipo_documento,
        funcionario_id: selectedDocumento.funcionario.id,
        archivo: undefined,
        aprobado: selectedDocumento.aprobado,
      });
      setSelectedFile(null);
    }
  }, [selectedDocumento, form]);

  const onSubmit = async (data: UpdateDocumentoFormData) => {
    if (!selectedDocumento) return;

    try {
      const updateData: any = {
        aprobado: data.aprobado,
      };

      // Solo incluir campos que han cambiado
      if (data.tipo_documento && data.tipo_documento !== selectedDocumento.tipo_documento) {
        updateData.tipo_documento = data.tipo_documento as TipoDocumento;
      }
      
      if (data.funcionario_id && data.funcionario_id !== selectedDocumento.funcionario.id) {
        updateData.funcionario_id = data.funcionario_id;
      }
      
      if (data.archivo) {
        updateData.archivo = data.archivo;
      }

      await updateDocumento.mutateAsync({
        id: selectedDocumento.id,
        data: updateData,
      });
      
      toast.success("Documento actualizado correctamente");
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar documento");
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedFile(null);
    closeEditDialog();
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    form.setValue("archivo", file);
    form.clearErrors("archivo");
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    form.setValue("archivo", undefined);
  };

  if (!selectedDocumento) return null;

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
          <DialogDescription>
            Modifica la información del documento. Si cambias el archivo, el anterior será reemplazado.
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
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo de documento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIPOS_DOCUMENTO.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Cambia el tipo de documento si es necesario
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Archivo actual y nuevo */}
            <div className="space-y-4">
              {selectedDocumento.url_archivo && !selectedFile && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Archivo actual</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedDocumento.tipo_documento}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedDocumento.url_archivo!, '_blank')}
                    >
                      Ver archivo
                    </Button>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="archivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedDocumento.url_archivo ? "Reemplazar archivo" : "Subir archivo"}
                    </FormLabel>
                    <FormControl>
                      <FileDropzone
                        onFileSelect={handleFileSelect}
                        onFileRemove={handleFileRemove}
                        selectedFile={selectedFile}
                        disabled={updateDocumento.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedDocumento.url_archivo 
                        ? "Sube un nuevo archivo para reemplazar el actual"
                        : "Sube un archivo para este documento"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      Marca esta opción si el documento está aprobado
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
                disabled={updateDocumento.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateDocumento.isPending}
              >
                {updateDocumento.isPending ? "Actualizando..." : "Actualizar Documento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}