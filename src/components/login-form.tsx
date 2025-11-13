"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, LogIn } from "lucide-react"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useLogin } from '@/hooks/auth.queries'
import { useRouter } from 'next/navigation'
import Logo from "./logo"

// Esquema de validación
const formSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida")
})

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const router = useRouter()
  const loginMutation = useLogin()
  function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate(values, {
      onSuccess: () => {
        router.push('/dashboard')
      },
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="rounded-full bg-primary/10 p-3 mb-2">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold">Inicia Sesión</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Ingresa tus credenciales para acceder a tu cuenta.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email")}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            {/* <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link> */}
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className={errors.password ? "border-destructive" : ""}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              </span>
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.status === 'pending'}
        >
          {loginMutation.status === 'pending' ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>



        {loginMutation.status === 'error' && (
          <p className="mt-2 text-sm text-destructive">
            {/* Mostrar un mensaje genérico sin exponer detalles del backend */}
            Correo o contraseña incorrectos
          </p>
        )}
      </div>

    {
      /*
        <div className="text-center text-sm">
        ¿No tienes una cuenta?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Regístrate
        </Link>
      </div>
      */
    }
    </form>
  )
}