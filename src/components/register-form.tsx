"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useForm, FormProvider } from 'react-hook-form'
import { UserPlus, Eye, EyeOff } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useRegister } from '@/hooks/auth.queries'
import { redirect, useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from 'sonner'
import Logo from "./logo"
// Esquema de validación
const formSchema = z.object({
    email: z.email("Correo electrónico inválido"),
    firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    department: z.string().min(1, "Por favor seleccione un departamento"),
    rank: z.string().min(1, "Por favor seleccione un grado jerárquico"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"]
})

export function RegisterForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            firstName: "",
            lastName: "",
            department: "",
            rank: "",

            password: "",
            confirmPassword: ""
        }
    })

    const router = useRouter()
    const registerMutation = useRegister()
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await registerMutation.mutateAsync({
                email: values.email,
                password: values.password,
                rol_id: 3,
                funcionario: {
                    primer_nombre: values.firstName,
                    primer_apellido: values.lastName,
                    expedido: values.department,
                    sexo: 'M',
                    grado_jerarquico: values.rank,
                    estado_funcionario: 'Activo',
                }
            })
            router.push('/dashboard')
        } catch (error: any) {
            if (error.response?.status === 422) {
                const errors = error.response?.data?.errors || {}
                Object.entries(errors).forEach(([key, msgs]) => {
                    let field = key
                    if (key.startsWith('funcionario.')) {
                        const sub = key.split('.')[1]
                        const map: Record<string, string> = {
                            primer_nombre: 'firstName',
                            primer_apellido: 'lastName',
                            expedido: 'department',
                            grado_jerarquico: 'rank'
                        }
                        field = map[sub] || field
                    }
                    form.setError(field as any, { type: 'server', message: (msgs as string[])[0] })
                })
            } else {
                toast.error(error.response?.data?.message || 'Error al registrar')
            }
        }
    }

    return (
        <div className="w-full max-w-md sm:max-w-lg md:max-w-3xl mx-auto p-4 sm:p-6 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex flex-col items-center gap-2 text-center mb-8">
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                    <Logo />
                </div>
                <h1 className="text-2xl font-bold">Registro de Usuario</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Complete el formulario para crear una nueva cuenta
                </p>
            </div>

            <FormProvider {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className={cn("flex flex-col gap-4 sm:gap-6", className)}
                    {...props}
                >
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                        {/* Email - Ocupa ambas columnas */}
                        <div className="md:col-span-2 grid gap-3">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ejemplo@dominio.test"
                                {...form.register("email")}
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        {/* Primer Nombre */}
                        <div className="grid gap-3">
                            <Label htmlFor="firstName">Primer Nombre</Label>
                            <Input
                                id="firstName"
                                placeholder="Juan"
                                {...form.register("firstName")}
                            />
                            {form.formState.errors.firstName && (
                                <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
                            )}
                        </div>

                        {/* Primer Apellido */}
                        <div className="grid gap-3">
                            <Label htmlFor="lastName">Primer Apellido</Label>
                            <Input
                                id="lastName"
                                placeholder="Pérez"
                                {...form.register("lastName")}
                            />
                            {form.formState.errors.lastName && (
                                <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
                            )}
                        </div>

                        {/* Expedido */}
                        <div className="grid gap-3">
                            <Label htmlFor="department">Expedido</Label>
                            <Select onValueChange={(value) => form.setValue("department", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione departamento" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LP">La Paz</SelectItem>
                                    <SelectItem value="OR">Oruro</SelectItem>
                                    <SelectItem value="PT">Potosí</SelectItem>
                                    <SelectItem value="CB">Cochabamba</SelectItem>
                                    <SelectItem value="CH">Chuquisaca</SelectItem>
                                    <SelectItem value="TJ">Tarija</SelectItem>
                                    <SelectItem value="SC">Santa Cruz</SelectItem>
                                    <SelectItem value="BE">Beni</SelectItem>
                                    <SelectItem value="PA">Pando</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.department && (
                                <p className="text-sm text-destructive">{form.formState.errors.department.message}</p>
                            )}
                        </div>

                        {/* Grado Jerárquico */}
                        <div className="grid gap-3">
                            <Label htmlFor="rank">Grado Jerárquico</Label>
                            <Select onValueChange={(value) => form.setValue("rank", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione grado" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                    <SelectItem value="Coronel">Coronel</SelectItem>
                                    <SelectItem value="Teniente coronel">Teniente coronel</SelectItem>
                                    <SelectItem value="Mayor">Mayor</SelectItem>
                                    <SelectItem value="Capitán">Capitán</SelectItem>
                                    <SelectItem value="Teniente">Teniente</SelectItem>
                                    <SelectItem value="Sub teniente">Sub teniente</SelectItem>
                                    <SelectItem value="Sub oficial superior">Sub oficial superior</SelectItem>
                                    <SelectItem value="Sub oficial primero">Sub oficial primero</SelectItem>
                                    <SelectItem value="Sub oficial segundo">Sub oficial segundo</SelectItem>
                                    <SelectItem value="Sargento mayor">Sargento mayor</SelectItem>
                                    <SelectItem value="Sargento primero">Sargento primero</SelectItem>
                                    <SelectItem value="Sargento segundo">Sargento segundo</SelectItem>
                                    <SelectItem value="Sargento inicial">Sargento inicial</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.rank && (
                                <p className="text-sm text-destructive">{form.formState.errors.rank.message}</p>
                            )}
                        </div>

                        {/* Contraseña */}
                        <div className="grid gap-3">
                            <Label htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...form.register("password")}
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
                            {form.formState.errors.password && (
                                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirmar Contraseña */}
                        <div className="grid gap-3">
                            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...form.register("confirmPassword")}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">
                                        {showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    </span>
                                </Button>
                            </div>
                            {form.formState.errors.confirmPassword && (
                                <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={registerMutation.status === 'pending'}
                    >
                        {registerMutation.status === 'pending' ? 'Registrando...' : 'Registrar Usuario'}
                    </Button>
                    {registerMutation.status === 'error' && (
                        <p className="mt-2 text-sm text-destructive">
                            {(registerMutation.error as Error)?.message}
                        </p>
                    )}
                </form>
            </FormProvider>

            <div className="text-center text-sm mt-6">
                ¿Ya tiene una cuenta?{" "}
                <Link
                    href="/login"
                    className="font-medium text-primary hover:underline"
                >
                    Iniciar Sesión
                </Link>
            </div>
        </div>
    )
}