"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, File, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile?: File | null;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
}

export function FileDropzone({
  onFileSelect,
  onFileRemove,
  selectedFile,
  accept = "image/*", // Solo imágenes
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  disabled = false,
}: FileDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileSelect(file);
      
      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxSize,
    multiple: false,
    disabled,
  });

  const handleRemoveFile = () => {
    onFileRemove();
    setPreview(null);
  };

  const getFileIcon = (file: File) => {
    return <Image className="h-8 w-8 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (selectedFile) {
    return (
      <div className={cn("relative border-2 border-dashed border-gray-300 rounded-lg p-6", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-lg"
                />
              </div>
            ) : (
              getFileIcon(selectedFile)
            )}
            <div>
              <p className="font-medium text-sm">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            disabled={disabled}
            className="text-red-500 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <input {...getInputProps()} />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragActive
              ? "Suelta la imagen aquí"
              : "Arrastra una imagen aquí, o haz clic para seleccionar"}
          </p>
          <p className="text-sm text-muted-foreground">
            Solo imágenes (PNG, JPG, JPEG, GIF, WEBP)
          </p>
          <p className="text-xs text-muted-foreground">
            Tamaño máximo: {formatFileSize(maxSize)}
          </p>
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-2 text-sm text-red-600">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name}>
              {errors.map((error) => (
                <p key={error.code}>
                  {error.code === "file-too-large" && "El archivo es demasiado grande"}
                  {error.code === "file-invalid-type" && "Tipo de archivo no válido"}
                  {error.code === "too-many-files" && "Solo se permite un archivo"}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}