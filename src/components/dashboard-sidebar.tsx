
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import {
  Users,
  UserCheck,
  Briefcase,
  Building,
  Calendar,
  AlertTriangle,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

// Tipos
type MenuItem = {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: string[];
};

type MenuCategory = {
  title: string;
  icon: React.ComponentType<any>;
  items: MenuItem[];
};

// Configuración del menú
const menuCategories: MenuCategory[] = [
  {
    title: "Administración",
    icon: LayoutDashboard,
    items: [
      {
        title: "Panel de Control",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["Administrador"],
      },
      {
        title: "Reportes",
        href: "/dashboard/reportes",
        icon: FileText,
        roles: ["Administrador"],
      },
      {
        title: "Usuarios Administradores",
        href: "/dashboard/usuarios",
        icon: UserCheck,
        roles: ["SuperAdministrador"],
      },
      {
        title: "Informacion Institucional",
        href: "/dashboard/sobre-institucion",
        icon: Building,
        roles: ["Administrador", "Usuario"],
      },
      {
        title: "Historial de Sesiones",
        href: "/dashboard/sesiones",
        icon: Calendar,
        roles: ["SuperAdministrador"],
      },
      {
        title: "Sanciones por Vencer",
        href: "/dashboard/sanciones-por-mes",
        icon: AlertTriangle,
        roles: ["Administrador"],
      },
      {
        title: "Permisos por Vencer",
        href: "/dashboard/ausencias-por-vencer",
        icon: Calendar,
        roles: ["Administrador"],
      },
      {
        title: "Comisiones por Vencer",
        href: "/dashboard/comisiones/por-vencer",
        icon: Briefcase,
        roles: ["Administrador"],
      }

    ],
  },
  {
    title: "Funcionarios Policiales",
    icon: Users,
    items: [
      {
        title: "Auditoría",
        href: "/dashboard/auditoria",
        icon: FileText,
        roles: ["Administrador"],
      },
      {
        title: "Funcionarios",
        href: "/dashboard/funcionarios",
        icon: Users,
        roles: ["Administrador"],
      },
      {
        title: "Cargos",
        href: "/dashboard/cargos",
        icon: Briefcase,
        roles: ["Administrador"],
      },
      {
        title: "Funcionario-Cargos",
        href: "/dashboard/funcionario-cargos",
        icon: Briefcase,
        roles: ["Administrador"],
      },
      {
        title: "Unidades",
        href: "/dashboard/unidades",
        icon: Building,
        roles: ["Administrador"],
      },
      {
        title: "Cambio de Destino",
        href: "/dashboard/cambio-destino",
        icon: Building,
        roles: ["Administrador"],
      },
      {
        title: "Permisos y Bajas Médicas",
        href: "/dashboard/ausencias",
        icon: Calendar,
        roles: ["Administrador"],
      },
      {
        title: "Sanciones",
        href: "/dashboard/sanciones",
        icon: AlertTriangle,
        roles: ["Administrador"],
      },
      {
        title: "Faltas Disciplinarias",
        href: "/dashboard/faltas-disciplinarias",
        icon: AlertTriangle,
        roles: ["Administrador"],
      },
      {
        title: "Comisiones",
        href: "/dashboard/comisiones",
        icon: Briefcase,
        roles: ["Administrador"],
      },
      {
        title: "Documentos",
        href: "/dashboard/documentos",
        icon: FileText,
        roles: ["Administrador"],
      },
    ],
  },
  {
    title: "Mi Información",
    icon: User,
    items: [
      {
        title: "Mis Datos",
        href: "/dashboard/mis-datos",
        icon: User,
        roles: ["Usuario", "Administrador"],
      },
      {
        title: "Mis Cargos",
        href: "/dashboard/mis-cargos",
        icon: Briefcase,
        roles: ["Usuario", "Administrador"],
      },
      {
        title: "Mis Permisos y Bajas Médicas",
        href: "/dashboard/mis-ausencias",
        icon: Calendar,
        roles: ["Usuario", "Administrador"],
      },
      {
        title: "Mis Sanciones",
        href: "/dashboard/mis-sanciones",
        icon: AlertTriangle,
        roles: ["Usuario", "Administrador"],
      },
      {
        title: "Mis Faltas Disciplinarias",
        href: "/dashboard/mis-faltas-disciplinarias",
        icon: AlertTriangle,
        roles: ["Usuario", "Administrador"],
      },
      {
        title: "Mis Cambios de Destino",
        href: "/dashboard/mis-cambios-destino",
        icon: Building,
        roles: ["Usuario", "Administrador"],
      },
      {
        title: "Mis Comisiones",
        href: "/dashboard/mis-comisiones",
        icon: Briefcase,
        roles: ["Usuario", "Administrador"],
      },
      {
        title: "Mis Documentos",
        href: "/dashboard/mis-documentos",
        icon: FileText,
        roles: ["Usuario", "Administrador"],
      },
    ],
  },
];

// Componente del contenido del sidebar
function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const userRole = useAuthStore((state: any) => state.user?.rol?.nombre_rol) || "";

  // Filtrar categorías visibles según rol
  const visibleCategories = menuCategories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => item.roles.includes(userRole)),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header del sidebar - solo para mobile */}
      {onLinkClick && (
        <div className="p-6 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <Image
                src="/logo-utop.png"
                alt="Logo UTOP"
                width={50}
                height={50}
                className="rounded-xl shadow-lg w-auto h-auto"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Unidad Tactica
              </h1>
              <p className="text-sm text-muted-foreground">de Operaciones Policiales</p>
            </div>
          </div>

          {/* Info del usuario */}

        </div>
      )}

      {/* Menú scrollable – versión recta + single open */}
      <div className={cn("flex-1 overflow-hidden", onLinkClick ? "px-3 py-2" : "px-3 py-4")}>
        <ScrollArea className="h-full">
          <Accordion
            type="single"               // <- solo uno abierto
            collapsible                 // <- permite cerrar el abierto
            className="space-y-2"
            defaultValue={visibleCategories.find(c => c.items.some(i => i.href === pathname))?.title}
          >
            {visibleCategories.map((category) => {
              const Icon = category.icon;
              const hasActiveItem = category.items.some((item) => pathname === item.href);

              return (
                <AccordionItem
                  value={category.title}
                  key={category.title}
                  className="border-none"
                >
                  <AccordionTrigger
                    className={cn(
                      "px-3 py-2.5 hover:no-underline rounded-lg text-sm font-medium",
                      "transition-all duration-200 ease-in-out",
                      "hover:bg-accent/60 data-[state=open]:bg-accent/30"
                    )}
                  >
                    <div className="flex items-center w-full">
                      <div
                        className={cn(
                          "grid h-7 w-7 place-content-center rounded-md mr-3",
                          hasActiveItem ? "bg-primary/20" : "bg-primary/10"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1 text-left">{category.title}</span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pt-2 pb-2 flex flex-col gap-2">
                    {category.items.map((item) => {
                      const IconItem = item.icon;
                      const isActive = pathname === item.href;

                      return (
                        <Link key={item.href} href={item.href} onClick={onLinkClick}>
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                              "w-full justify-start h-9 px-3 text-sm",
                              "transition-all duration-200",
                              isActive
                                ? "bg-primary text-primary-foreground shadow"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                            )}
                          >
                            <IconItem className="mr-3 h-3.5 w-3.5" />
                            <span className="truncate">{item.title}</span>
                            {isActive && (
                              <span className="ml-auto h-2 w-2 rounded-full bg-primary-foreground" />
                            )}
                          </Button>
                        </Link>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
      </div>
      {/* Footer - solo para mobile */}
      {onLinkClick && (
        <div className="p-4 border-t border-border/30 bg-gradient-to-r from-accent/20 to-accent/10 flex-shrink-0">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Sistema U.T.O.P</p>
            <p className="text-xs text-muted-foreground">Versión 2.0</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente del trigger móvil
export function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-accent/50 transition-all duration-200"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Menú de navegación</SheetTitle>
        </SheetHeader>
        <SidebarContent onLinkClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Get user role at the top level to avoid conditional hook calls
  const userRole = useAuthStore((state: any) => state.user?.rol?.nombre_rol) || "";

  // Detectar si es móvil y manejar hydration
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevenir hydration mismatch
  if (!mounted) {
    return null;
  }

  // No renderizar sidebar en móvil (se usa el Sheet)
  if (isMobile) {
    return null;
  }

  // Filter visible categories based on user role
  const visibleCategories = menuCategories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => item.roles.includes(userRole)),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "bg-background/95 backdrop-blur-sm border-r border-border/50 flex flex-col transition-all duration-300 h-full min-h-0 shadow-sm",
          collapsed ? "w-16" : "w-72"
        )}
      >
        {/* Header mejorado */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src="/logo-utop.png"
                  alt="Logo UTOP"
                  width={45}
                  height={45}
                  className="rounded-lg shadow-sm w-auto h-auto"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  U.T.O.P
                </h1>
                <p className="text-xs text-muted-foreground">Sistema de Gestión</p>
              </div>
            </div>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="hover:bg-accent/50 transition-all duration-200 hover:scale-105"
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? "Expandir menú" : "Contraer menú"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Contenido del sidebar */}
        {!collapsed ? (
          <div className="flex-1 overflow-hidden px-4 py-4">
            <SidebarContent />
          </div>
        ) : (
          <ScrollArea className="flex-1 py-4 px-2">
            <div className="space-y-2">
              {visibleCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Tooltip key={category.title}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-full h-12 hover:bg-accent/50"
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {category.title}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        <div
          className={cn(
            "p-4 border-t bg-gradient-to-r from-[#25D36622] to-[#128C7E15] dark:from-[#25D36615] dark:to-[#128C7E10] border-border/30",
            collapsed && "p-2"
          )}
        >
          {!collapsed ? (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Cualquier duda o consulta, comunicarse con el administrador del sistema.
              </p>

              <Link href="https://wa.me/59160713091" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="mt-2 w-full justify-center gap-2 border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/10 dark:text-[#25D366] dark:border-[#25D366] dark:hover:bg-[#25D366]/20 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                  </svg>
                  Contactar por WhatsApp
                </Button>
              </Link>
            </div>
          ) : (
            <div className="w-full h-8 bg-[#128C7E15] dark:bg-[#25D36615] rounded-md flex items-center justify-center">
              <div className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse"></div>
            </div>
          )}
        </div>

      </div>
    </TooltipProvider>
  );
}
