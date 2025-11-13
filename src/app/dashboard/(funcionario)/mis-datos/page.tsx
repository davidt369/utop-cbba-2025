"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Shield,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Edit,
  FileText,
  CheckCircle,
  Clock,
  Send,
  AlertTriangle,
  Activity,
  Briefcase,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useMiPerfil, useEstadisticasPersonales, useResumenActividades } from "@/hooks/mi-perfil.queries";
import { EditDatosFuncionarioDialog } from "@/components/mi-perfil/edit-datos-funcionario-dialog";
import { EditEmailDialog } from "@/components/mi-perfil/edit-email-dialog";
import { EditPasswordDialog } from "@/components/mi-perfil/edit-password-dialog";

export default function MisDatosPage() {
  const { data: perfil, isLoading: isLoadingPerfil, error: errorPerfil } = useMiPerfil();
  const { data: estadisticas, isLoading: isLoadingStats } = useEstadisticasPersonales();
  const { data: resumen, isLoading: isLoadingResumen } = useResumenActividades();

  // Debug: Ver qué datos están llegando
  console.log("Perfil data:", perfil);
  console.log("Usuario data:", perfil?.usuario);
  console.log("Rol data:", perfil?.usuario?.rol);
  console.log("Error perfil:", errorPerfil);

  const [showEditDatos, setShowEditDatos] = useState(false);
  const [showEditEmail, setShowEditEmail] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  if (isLoadingPerfil) {
    return <LoadingSkeleton />;
  }

  if (errorPerfil || !perfil) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar tu información personal. Por favor, intenta de nuevo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Si el usuario necesita completar su perfil
  if (perfil.needs_completion) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Completar Perfil</h2>
            <p className="text-muted-foreground">
              Para continuar, necesitas completar tu información como funcionario
            </p>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tu cuenta de usuario está activa, pero necesitas completar tu información como funcionario para acceder a todas las funcionalidades.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Completar Información Personal
            </CardTitle>
            <CardDescription>
              Proporciona tus datos básicos como funcionario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email de la cuenta</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{perfil.usuario.email}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Rol asignado</p>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{perfil.usuario.rol.nombre_rol}</p>
                </div>
              </div>

              <Button
                onClick={() => setShowEditDatos(true)}
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Completar Información Personal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Diálogo de edición */}
        <EditDatosFuncionarioDialog
          isOpen={showEditDatos}
          onClose={() => setShowEditDatos(false)}
          funcionario={perfil}
        />
      </div>
    );
  }

  const nombreCompleto = [
    perfil.primer_nombre,
    perfil.segundo_nombre,
    perfil.primer_apellido,
    perfil.segundo_apellido,
  ].filter(Boolean).join(" ");

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Suspendido':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Baja medica':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'De Vacaciones':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'En permiso':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Baja Definitiva':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mis Datos Personales</h2>
          <p className="text-muted-foreground">
            Administra tu información personal y configuración de cuenta
          </p>
        </div>
      </div>

      {/* Estadísticas Personales */}
      {isLoadingStats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : estadisticas ? (
        <div className="space-y-6">
          {/* Primera fila - Estadísticas principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mis Documentos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.documentos.total}</div>
                <p className="text-xs text-muted-foreground">
                  {estadisticas.documentos.aprobados} aprobados, {estadisticas.documentos.pendientes} pendientes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mis Ausencias</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.ausencias.total}</div>
                <p className="text-xs text-muted-foreground">
                  {estadisticas.ausencias.aprobadas} aprobadas, {estadisticas.ausencias.activas} activas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mis Comisiones</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.comisiones.total}</div>
                <p className="text-xs text-muted-foreground">
                  {estadisticas.comisiones.aprobadas} aprobadas, {estadisticas.comisiones.activas} activas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mis Sanciones</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.sanciones.total}</div>
                <p className="text-xs text-muted-foreground">
                  {estadisticas.sanciones.activas} activas, {estadisticas.sanciones.inactivas} inactivas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Segunda fila - Estadísticas adicionales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faltas Disciplinarias</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.faltas_disciplinarias.total}</div>
                <p className="text-xs text-muted-foreground">
                  {estadisticas.faltas_disciplinarias.leves} leves, {estadisticas.faltas_disciplinarias.graves} graves
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mis Cargos</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.cargos.total}</div>
                <p className="text-xs text-muted-foreground">
                  {estadisticas.cargos.activos} activos, {estadisticas.cargos.inactivos} inactivos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cambios de Destino</CardTitle>
                <MapPin className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.cambios_destino}</div>
                <p className="text-xs text-muted-foreground">
                  Movimientos de destino
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faltas Muy Graves</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{estadisticas.faltas_disciplinarias.muy_graves}</div>
                <p className="text-xs text-muted-foreground">
                  Faltas de mayor gravedad
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {/* Resumen de Actividades Recientes */}
      {isLoadingResumen ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : resumen ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividades Recientes
            </CardTitle>
            <CardDescription>
              Resumen de tus actividades en los últimos {resumen.periodo_consulta}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Actividades recientes */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Nuevas Actividades</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Documentos</span>
                    </div>
                    <Badge variant={resumen.actividades_recientes.documentos > 0 ? "default" : "secondary"}>
                      {resumen.actividades_recientes.documentos}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Ausencias</span>
                    </div>
                    <Badge variant={resumen.actividades_recientes.ausencias > 0 ? "default" : "secondary"}>
                      {resumen.actividades_recientes.ausencias}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Comisiones</span>
                    </div>
                    <Badge variant={resumen.actividades_recientes.comisiones > 0 ? "default" : "secondary"}>
                      {resumen.actividades_recientes.comisiones}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Estado de documentación */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Estado de Documentación</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completado</span>
                    <span className="text-2xl font-bold text-green-600">
                      {resumen.porcentaje_documentacion}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${resumen.porcentaje_documentacion}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {resumen.porcentaje_documentacion === 100
                      ? 'Documentación completa'
                      : 'Documentos pendientes por subir'
                    }
                  </p>
                </div>
              </div>

              {/* Alertas/Observaciones */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Observaciones</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Faltas</span>
                    </div>
                    <Badge variant={resumen.actividades_recientes.faltas > 0 ? "destructive" : "secondary"}>
                      {resumen.actividades_recientes.faltas}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Sanciones</span>
                    </div>
                    <Badge variant={resumen.actividades_recientes.sanciones > 0 ? "destructive" : "secondary"}>
                      {resumen.actividades_recientes.sanciones}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Datos básicos de tu perfil como funcionario
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditDatos(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                <p className="text-lg font-semibold">{nombreCompleto}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Carnet de Identidad</p>
                  <p className="font-medium">{perfil.numero_carnet || 'No registrado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expedido en</p>
                  <p className="font-medium">{perfil.expedido}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sexo</p>
                  <p className="font-medium">{perfil.sexo === 'M' ? 'Masculino' : 'Femenino'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Grado Jerárquico</p>
                  <p className="font-medium">{perfil.grado_jerarquico}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <Badge className={getEstadoColor(perfil.estado_funcionario)}>
                  {perfil.estado_funcionario}
                </Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">Número de Escalafón</p>
                <p className="font-medium">{perfil.numero_escalafon || 'No registrado'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Datos de Contacto</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{perfil.direccion || 'No registrada'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{perfil.numero_celular || 'No registrado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{perfil.numero_cuenta_bancaria || 'No registrada'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de Cuenta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Información de Cuenta
            </CardTitle>
            <CardDescription>
              Configuración de tu cuenta de usuario y credenciales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{perfil.usuario.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditEmail(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Cambiar
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Contraseña</p>
                  <p className="text-sm text-muted-foreground">
                    ••••••••••••
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditPassword(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Cambiar
                </Button>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">Rol del Usuario</p>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{perfil.usuario.rol.nombre_rol}</span>
                </div>
                {perfil.usuario.rol.descripcion && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {perfil.usuario.rol.descripcion}
                  </p>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cuenta Creada</p>
                  <p className="text-sm">
                    {perfil.usuario.created_at
                      ? format(new Date(perfil.usuario.created_at), "dd 'de' MMMM, yyyy", { locale: es })
                      : 'Fecha no disponible'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
                  <p className="text-sm">
                    {perfil.updated_at
                      ? format(new Date(perfil.updated_at), "dd 'de' MMMM, yyyy", { locale: es })
                      : 'Sin actualizaciones'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogos de edición */}
      <EditDatosFuncionarioDialog
        isOpen={showEditDatos}
        onClose={() => setShowEditDatos(false)}
        funcionario={perfil}
      />

      <EditEmailDialog
        isOpen={showEditEmail}
        onClose={() => setShowEditEmail(false)}
        funcionario={perfil}
      />

      <EditPasswordDialog
        isOpen={showEditPassword}
        onClose={() => setShowEditPassword(false)}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      {/* Skeleton para estadísticas */}
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i + 4}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Skeleton para cards principales */}
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-80" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(6)].map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}