'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FileText,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Upload,
  User,
  MapPin,
  Camera,
  Shield,
  CreditCard
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MiDocumento } from '@/types/mis-documentos.types';

interface MisDocumentosTableProps {
  documentos: MiDocumento[];
  tiposFaltantes: string[];
  isLoading?: boolean;
  onSubirDocumento?: (tipo: string) => void;
}

const getEstadoBadge = (aprobado: boolean) => {
  if (aprobado) {
    return <Badge variant="default" className="flex items-center gap-1">
      <CheckCircle className="h-3 w-3" />
      Aprobado
    </Badge>;
  } else {
    return <Badge variant="secondary" className="flex items-center gap-1">
      <Clock className="h-3 w-3" />
      Pendiente
    </Badge>;
  }
};

const getTipoIcon = (tipo: string) => {
  const iconProps = { className: "h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" };

  switch (tipo) {
    case 'Foto de perfil':
      return <User {...iconProps} />;
    case 'Memorandum destino':
      return <FileText {...iconProps} />;
    case 'Foto ubicación / croquis':
      return <MapPin {...iconProps} />;
    case 'Foto AVC04':
      return <Camera {...iconProps} />;
    case 'Sigep':
      return <Shield {...iconProps} />;
    case 'Foto carnet':
      return <CreditCard {...iconProps} />;
    default:
      return <FileText {...iconProps} />;
  }
};

export function MisDocumentosTable({
  documentos,
  tiposFaltantes,
  isLoading,
  onSubirDocumento
}: MisDocumentosTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Mis Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Documentos existentes */}
      {documentos.length > 0 && (
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Mis Documentos ({documentos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {/* Vista móvil - Cards */}
            <div className="block sm:hidden space-y-3">
              {documentos.map((documento) => (
                <div key={documento.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {getTipoIcon(documento.tipo_documento)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{documento.tipo_documento}</p>
                      <div className="mt-1">
                        {getEstadoBadge(documento.aprobado)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {documento.tiene_archivo ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Subido</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Sin archivo</span>
                        </>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {format(new Date(documento.created_at), "dd/MM/yy", { locale: es })}
                    </span>
                  </div>

                  {documento.tiene_archivo && documento.url_archivo && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => window.open(documento.url_archivo!, '_blank')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = documento.url_archivo!;
                          link.download = `${documento.tipo_documento.replace(/\s+/g, '_')}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Vista desktop - Tabla */}
            <div className="hidden sm:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Documento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Fecha de Subida</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentos.map((documento) => (
                    <TableRow key={documento.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getTipoIcon(documento.tipo_documento)}
                          <div>
                            <p className="font-medium">{documento.tipo_documento}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getEstadoBadge(documento.aprobado)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {documento.tiene_archivo ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">Archivo subido</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Sin archivo</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(documento.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {documento.tiene_archivo && documento.url_archivo && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(documento.url_archivo!, '_blank')}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = documento.url_archivo!;
                                  link.download = `${documento.tipo_documento.replace(/\s+/g, '_')}.jpg`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Descargar
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentos faltantes */}
      {tiposFaltantes.length > 0 && (
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
              Documentos Pendientes ({tiposFaltantes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {tiposFaltantes.map((tipo) => (
                <div key={tipo} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {getTipoIcon(tipo)}
                      <div className="flex-1">
                        <p className="font-medium text-sm sm:text-base">{tipo}</p>
                        <p className="text-xs sm:text-sm text-red-600">No subido</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onSubirDocumento?.(tipo)}
                      className="w-full sm:w-auto mt-2 sm:mt-0"
                    >
                      <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Subir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado cuando no hay documentos */}
      {documentos.length === 0 && tiposFaltantes.length === 6 && (
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">Mis Documentos</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-center py-6 sm:py-8">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">
                No tienes documentos subidos
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Necesitas subir 6 tipos de documentos requeridos
              </p>
              <Button
                onClick={() => onSubirDocumento?.(tiposFaltantes[0])}
                className="w-full sm:w-auto"
              >
                <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Subir primer documento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}