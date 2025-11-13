'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileImage, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SubirDocumentoProps {
  tipoDocumento: string;
  onSubir: (archivo: File, tipo: string) => Promise<void>;
  onCancelar: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
}

const getMaxFileSize = () => 5 * 1024 * 1024; // 5MB

const validateFile = (file: File) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const maxSize = getMaxFileSize();

  if (!allowedTypes.includes(file.type)) {
    return 'Solo se permiten archivos de imagen (JPG, JPEG, PNG)';
  }

  if (file.size > maxSize) {
    return 'El archivo no puede ser mayor a 5MB';
  }

  return null;
};

const getTipoIcon = (tipo: string) => {
  switch (tipo) {
    case 'Foto de perfil':
      return '👤';
    case 'Memorandum destino':
      return '📄';
    case 'Foto ubicación / croquis':
      return '🗺️';
    case 'Foto AVC04':
      return '📋';
    case 'Sigep':
      return '🛡️';
    case 'Foto carnet':
      return '🆔';
    default:
      return '📄';
  }
};

const getTipoDescripcion = (tipo: string) => {
  switch (tipo) {
    case 'Foto de perfil':
      return 'Fotografía frontal en formato profesional';
    case 'Memorandum destino':
      return 'Documento oficial de asignación de destino';
    case 'Foto ubicación / croquis':
      return 'Imagen del lugar de trabajo o croquis de ubicación';
    case 'Foto AVC04':
      return 'Formulario AVC04 completado y firmado';
    case 'Sigep':
      return 'Documento del Sistema SIGEP';
    case 'Foto carnet':
      return 'Fotografía tipo carnet del funcionario';
    default:
      return 'Documento requerido del sistema';
  }
};

export function SubirDocumento({
  tipoDocumento,
  onSubir,
  onCancelar,
  isUploading = false,
  uploadProgress = 0
}: SubirDocumentoProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await onSubir(selectedFile, tipoDocumento);
      // Reset después de subida exitosa
      setSelectedFile(null);
      setPreview(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el archivo');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span className="text-2xl">{getTipoIcon(tipoDocumento)}</span>
          <div>
            <h3>Subir {tipoDocumento}</h3>
            <p className="text-sm text-muted-foreground font-normal">
              {getTipoDescripcion(tipoDocumento)}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Zona de drop */}
        {!selectedFile && !isUploading && (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Arrastra tu archivo aquí o haz clic para seleccionar
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Formatos permitidos: JPG, JPEG, PNG • Tamaño máximo: 5MB
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Seleccionar archivo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        )}

        {/* Preview del archivo */}
        {selectedFile && preview && !isUploading && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-w-md mx-auto rounded-lg border"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileImage className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Listo para subir</Badge>
            </div>
          </div>
        )}

        {/* Progreso de subida */}
        {isUploading && (
          <div className="space-y-4">
            <div className="text-center">
              <Upload className="h-8 w-8 text-primary mx-auto mb-2 animate-pulse" />
              <p className="font-medium">Subiendo documento...</p>
              <p className="text-sm text-muted-foreground">
                {selectedFile?.name}
              </p>
            </div>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">
              {uploadProgress}% completado
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Acciones */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancelar}
            disabled={isUploading}
            className="flex-1"
          >
            Cancelar
          </Button>
          {selectedFile && !isUploading && (
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Documento
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}