
// 'use client';

import { redirect } from "next/navigation";

// import Link from 'next/link';
// import { 
//   Users, 
//   FileText, 
//   Briefcase, 
//   Activity,
//   Calendar,
//   UserCheck,
//   Upload,
//   Clock,
//   Building,
//   TrendingUp,
//   AlertTriangle,
//   CheckCircle
// } from 'lucide-react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { useEstadisticasGenerales } from '@/hooks/dashboard.queries';

// export default function DashboardHomePage() {
//   const { data: estadisticas, isLoading, error } = useEstadisticasGenerales();

//   if (isLoading) {
//     return (
//       <div className="space-y-8 p-6">
//         {/* Header skeleton */}
//         <div className="space-y-2">
//           <Skeleton className="h-8 w-64" />
//           <Skeleton className="h-4 w-96" />
//         </div>

//         {/* Cards skeleton */}
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           {[...Array(8)].map((_, i) => (
//             <Card key={i}>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <Skeleton className="h-4 w-20" />
//                 <Skeleton className="h-4 w-4" />
//               </CardHeader>
//               <CardContent>
//                 <Skeleton className="h-7 w-16 mb-2" />
//                 <Skeleton className="h-3 w-24" />
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Chart skeleton */}
//         <Card>
//           <CardHeader>
//             <Skeleton className="h-6 w-48" />
//             <Skeleton className="h-4 w-80" />
//           </CardHeader>
//           <CardContent>
//             <Skeleton className="h-64 w-full" />
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <Alert variant="destructive">
//           <AlertTriangle className="h-4 w-4" />
//           <AlertDescription>
//             Error al cargar las estadísticas del dashboard: {error.message}
//           </AlertDescription>
//         </Alert>
//       </div>
//     );
//   }

//   const stats = estadisticas?.data;

//   return (
//     <div className="space-y-8 p-6">
//       {/* Header */}
//       <div className="space-y-2">
//         <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
//         <p className="text-muted-foreground">
//           Resumen general del sistema de gestión de funcionarios policiales
//         </p>
//       </div>

//       {/* Estadísticas principales */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         {/* Funcionarios */}
//         <Link href="/dashboard/funcionarios">
//           <Card className="hover:shadow-md transition-shadow cursor-pointer">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Funcionarios</CardTitle>
//               <Users className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stats?.funcionarios.total || 0}</div>
//               <p className="text-xs text-muted-foreground">
//                 {stats?.funcionarios.activos || 0} activos
//               </p>
//             </CardContent>
//           </Card>
//         </Link>

//         {/* Cargos */}
//         <Link href="/dashboard/cargos">
//           <Card className="hover:shadow-md transition-shadow cursor-pointer">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Cargos</CardTitle>
//               <Briefcase className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stats?.cargos.total || 0}</div>
//               <p className="text-xs text-muted-foreground">
//                 {stats?.cargos.asignados || 0} asignados
//               </p>
//             </CardContent>
//           </Card>
//         </Link>

//         {/* Documentos */}
//         <Link href="/dashboard/documentos">
//           <Card className="hover:shadow-md transition-shadow cursor-pointer">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Documentos</CardTitle>
//               <FileText className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stats?.documentos.total || 0}</div>
//               <p className="text-xs text-muted-foreground">
//                 {stats?.documentos.aprobados || 0} aprobados
//               </p>
//             </CardContent>
//           </Card>
//         </Link>

//         {/* Unidades */}
//         <Link href="/dashboard/unidades">
//           <Card className="hover:shadow-md transition-shadow cursor-pointer">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Unidades</CardTitle>
//               <Building className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stats?.unidades.total || 0}</div>
//               <p className="text-xs text-muted-foreground">
//                 {stats?.unidades.con_funcionarios || 0} con funcionarios
//               </p>
//             </CardContent>
//           </Card>
//         </Link>
//       </div>

//       {/* Actividades del mes */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         {/* Ausencias */}
//         <Link href="/dashboard/ausencias">
//           <Card className="hover:shadow-md transition-shadow cursor-pointer">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Ausencias del Mes</CardTitle>
//               <Calendar className="h-4 w-4 text-orange-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-orange-600">
//                 {stats?.actividades_recientes.ausencias_mes || 0}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 Solicitudes registradas
//               </p>
//             </CardContent>
//           </Card>
//         </Link>

//         {/* Comisiones */}
//         <Link href="/dashboard/comisiones">
//           <Card className="hover:shadow-md transition-shadow cursor-pointer">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Comisiones del Mes</CardTitle>
//               <Activity className="h-4 w-4 text-blue-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-blue-600">
//                 {stats?.actividades_recientes.comisiones_mes || 0}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 Comisiones asignadas
//               </p>
//             </CardContent>
//           </Card>
//         </Link>

//         {/* Sanciones */}
//         <Link href="/dashboard/sanciones">
//           <Card className="hover:shadow-md transition-shadow cursor-pointer">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Sanciones del Mes</CardTitle>
//               <AlertTriangle className="h-4 w-4 text-red-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-red-600">
//                 {stats?.actividades_recientes.sanciones_mes || 0}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 Sanciones aplicadas
//               </p>
//             </CardContent>
//           </Card>
//         </Link>

//         {/* Cambios de destino */}
//         <Link href="/dashboard/cambios-destino">
//           <Card className="hover:shadow-md transition-shadow cursor-pointer">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Cambios de Destino</CardTitle>
//               <TrendingUp className="h-4 w-4 text-green-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-green-600">
//                 {stats?.actividades_recientes.cambios_destino_mes || 0}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 Movimientos del mes
//               </p>
//             </CardContent>
//           </Card>
//         </Link>
//       </div>

//       {/* Resumen mensual */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Clock className="h-5 w-5" />
//             Resumen del Mes Actual
//           </CardTitle>
//           <CardDescription>
//             Actividades y registros del mes en curso
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//             <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
//               <UserCheck className="h-8 w-8 text-blue-600" />
//               <div>
//                 <p className="text-sm font-medium text-blue-700">Funcionarios Nuevos</p>
//                 <p className="text-2xl font-bold text-blue-600">
//                   {stats?.resumen_mensual.funcionarios_nuevos || 0}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
//               <Upload className="h-8 w-8 text-green-600" />
//               <div>
//                 <p className="text-sm font-medium text-green-700">Documentos Subidos</p>
//                 <p className="text-2xl font-bold text-green-600">
//                   {stats?.resumen_mensual.documentos_subidos || 0}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200">
//               <Calendar className="h-8 w-8 text-orange-600" />
//               <div>
//                 <p className="text-sm font-medium text-orange-700">Ausencias Solicitadas</p>
//                 <p className="text-2xl font-bold text-orange-600">
//                   {stats?.resumen_mensual.ausencias_solicitadas || 0}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 border border-purple-200">
//               <Activity className="h-8 w-8 text-purple-600" />
//               <div>
//                 <p className="text-sm font-medium text-purple-700">Comisiones Asignadas</p>
//                 <p className="text-2xl font-bold text-purple-600">
//                   {stats?.resumen_mensual.comisiones_asignadas || 0}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Crecimiento de funcionarios */}
//       {stats?.funcionarios.crecimiento_mes && stats.funcionarios.crecimiento_mes.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Crecimiento de Funcionarios</CardTitle>
//             <CardDescription>
//               Nuevos funcionarios registrados en los últimos 6 meses
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
//               {stats.funcionarios.crecimiento_mes.map((item, idx) => (
//                 <Card key={item.mes} className="bg-card border-border">
//                   <CardContent className="p-4">
//                     <div className="text-center">
//                       <div className="text-sm text-muted-foreground mb-1">
//                         {item.mes}
//                       </div>
//                       <Badge
//                         variant="secondary"
//                         className="text-lg font-bold px-3 py-1"
//                         style={{
//                           backgroundColor: `hsl(var(--chart-${(idx % 5) + 1}) / 0.1)`,
//                           color: `hsl(var(--chart-${(idx % 5) + 1}))`
//                         }}
//                       >
//                         {item.total}
//                       </Badge>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Estado de funcionarios */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Estado de Funcionarios</CardTitle>
//           <CardDescription>
//             Distribución actual por estado de servicio
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//             <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
//               <CheckCircle className="h-8 w-8 text-green-600" />
//               <div>
//                 <p className="text-sm font-medium text-green-700">Activos</p>
//                 <p className="text-2xl font-bold text-green-600">
//                   {stats?.funcionarios.activos || 0}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
//               <AlertTriangle className="h-8 w-8 text-red-600" />
//               <div>
//                 <p className="text-sm font-medium text-red-700">Suspendidos</p>
//                 <p className="text-2xl font-bold text-red-600">
//                   {stats?.funcionarios.suspendidos || 0}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 border border-purple-200">
//               <Calendar className="h-8 w-8 text-purple-600" />
//               <div>
//                 <p className="text-sm font-medium text-purple-700">De Vacaciones</p>
//                 <p className="text-2xl font-bold text-purple-600">
//                   {stats?.funcionarios.de_vacaciones || 0}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }



export default function HomePage() {  
  redirect('/dashboard'); 
}