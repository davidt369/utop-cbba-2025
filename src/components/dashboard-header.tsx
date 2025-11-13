"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { MobileSidebarTrigger } from "@/components/dashboard-sidebar"
import { useAuthStore } from '@/store/auth.store'
import { useLogout } from '@/hooks/auth.queries'
import { useFotoPerfil } from '@/hooks/foto-perfil.queries'
import { useRouter } from 'next/navigation'
import { User, LogOut, Bell } from 'lucide-react'

export function DashboardHeader() {
  const user = useAuthStore(state => state.user)
  const logout = useLogout()
  const { data: fotoPerfil, isLoading, error } = useFotoPerfil()
  const router = useRouter()

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => router.push('/login') })
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    const f = firstName?.charAt(0) ?? ''
    const l = lastName?.charAt(0) ?? ''
    const initials = (f + l).toUpperCase()
    return initials || 'U'
  }

  // URL de la foto de perfil si está disponible (sin importar si está aprobada para el perfil del usuario)
  const fotoUrl = fotoPerfil?.success &&
    fotoPerfil.data?.tiene_archivo &&
    fotoPerfil.data?.url_archivo
    ? fotoPerfil.data.url_archivo
    : undefined

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile menu trigger */}
          <MobileSidebarTrigger />



          <div className="min-w-0 flex-1">
            {/* Título en desktop */}
            <h1 className="hidden lg:block text-xl xl:text-2xl font-bold  bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Unidad Táctica de Operaciones Policiales
            </h1>
            {/* Título en tablet */}
            <h1 className="hidden md:block lg:hidden text-lg font-bold text-foreground">
              Unidad Táctica de Operaciones Policiales
            </h1>
            {/* Título en móvil */}
            <h1 className="md:hidden text-lg font-bold text-foreground">U.T.O.P</h1>

            {user?.funcionario && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                <span className="hidden sm:inline">Bienvenido, </span>
                {user.funcionario.primer_nombre} {user.funcionario.primer_apellido}
              </p>
            )}
            {!user && (
              <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground mt-0.5">
                Gestión integral de funcionarios y recursos humanos
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Indicador de notificaciones */}
          {/* <div className="hidden sm:flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 relative hover:bg-accent/50 transition-all duration-200"
            >
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-background">
                <div className="w-full h-full bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </Button>
          </div> */}

          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                  <AvatarImage
                    src={fotoUrl}
                    alt="Foto de perfil"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs sm:text-sm font-medium">
                    {user?.funcionario
                      ? getInitials(user.funcionario.primer_nombre, user.funcionario.primer_apellido)
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                {/* Indicador de estado online */}
                <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={fotoUrl} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.funcionario
                          ? getInitials(user.funcionario.primer_nombre, user.funcionario.primer_apellido)
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {user?.funcionario
                          ? `${user.funcionario.primer_nombre} ${user.funcionario.primer_apellido}`
                          : "Usuario"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground mt-1 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Rol:</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {user?.rol?.nombre_rol}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Mi Perfil</span>
              </DropdownMenuItem> */}
              <DropdownMenuItem className="cursor-pointer">
                <div className="mr-2 h-4 w-4 rounded-full bg-green-500"></div>
                <span>Estado: En línea</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}