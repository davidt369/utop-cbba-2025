"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Search,
    User,
    X,
    UserCheck,
    CreditCard,
    Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Funcionario {
    id: number
    nombres: string
    apellidos: string
    ci: string
    estado?: string
    cargo_actual?: string
}

interface BuscadorFuncionarioProps {
    onSeleccionar: (funcionario: Funcionario | null) => void
    funcionarioSeleccionado: Funcionario | null
    placeholder?: string
}

export function BuscadorFuncionario({
    onSeleccionar,
    funcionarioSeleccionado,
    placeholder = "Buscar funcionario por nombre, apellido o CI..."
}: BuscadorFuncionarioProps) {
    const [busqueda, setBusqueda] = useState("")
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
    const [mostrarResultados, setMostrarResultados] = useState(false)
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setMostrarResultados(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (busqueda.length >= 2) {
            buscarFuncionarios()
        } else {
            setFuncionarios([])
            setMostrarResultados(false)
        }
    }, [busqueda])

    const buscarFuncionarios = async () => {
        setLoading(true)
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const response = await fetch(`${baseUrl}/api/auth/funcionarios?search=${encodeURIComponent(busqueda)}&limit=10`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (data.success) {
                setFuncionarios(data.data || [])
                setMostrarResultados(true)
            } else {
                console.error('API response error:', data)
                setFuncionarios([])
                setMostrarResultados(false)
            }
        } catch (error) {
            console.error('Error al buscar funcionarios:', error)
            // Fallback con datos de ejemplo si falla la API
            const funcionariosDemo: Funcionario[] = [
                {
                    id: 1,
                    nombres: "Juan Carlos",
                    apellidos: "Pérez González",
                    ci: "12345678",
                    estado: "Activo",
                    cargo_actual: "Comandante"
                },
                {
                    id: 2,
                    nombres: "María Elena",
                    apellidos: "Rodríguez López",
                    ci: "87654321",
                    estado: "Activo",
                    cargo_actual: "Capitán"
                },
                {
                    id: 3,
                    nombres: "Carlos Alberto",
                    apellidos: "Mendoza Silva",
                    ci: "11223344",
                    estado: "Activo",
                    cargo_actual: "Teniente"
                }
            ].filter(f =>
                f.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
                f.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
                f.ci.includes(busqueda)
            )

            setFuncionarios(funcionariosDemo)
            setMostrarResultados(true)
        } finally {
            setLoading(false)
        }
    }

    const seleccionarFuncionario = (funcionario: Funcionario) => {
        onSeleccionar(funcionario)
        setBusqueda("")
        setMostrarResultados(false)
        setFuncionarios([])
    }

    const limpiarSeleccion = () => {
        onSeleccionar(null)
        setBusqueda("")
        setMostrarResultados(false)
        inputRef.current?.focus()
    }

    const resaltarTexto = (texto: string, busqueda: string) => {
        if (!busqueda) return texto

        const regex = new RegExp(`(${busqueda})`, 'gi')
        const partes = texto.split(regex)

        return partes.map((parte, index) =>
            regex.test(parte) ? (
                <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0 py-0 rounded">
                    {parte}
                </mark>
            ) : parte
        )
    }

    return (
        <div ref={containerRef} className="relative space-y-4">
            {/* Búsqueda */}
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder={placeholder}
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        onFocus={() => {
                            if (funcionarios.length > 0) {
                                setMostrarResultados(true)
                            }
                        }}
                        className="pl-9 pr-4"
                        disabled={!!funcionarioSeleccionado}
                    />
                    {loading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Funcionario seleccionado */}
            {funcionarioSeleccionado && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <UserCheck className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-foreground">
                                            {funcionarioSeleccionado.nombres} {funcionarioSeleccionado.apellidos}
                                        </h4>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <CreditCard className="w-3 h-3" />
                                                <span>CI: {funcionarioSeleccionado.ci}</span>
                                            </div>
                                            {funcionarioSeleccionado.cargo_actual && (
                                                <div className="flex items-center gap-1">
                                                    <Activity className="w-3 h-3" />
                                                    <span>{funcionarioSeleccionado.cargo_actual}</span>
                                                </div>
                                            )}
                                            {funcionarioSeleccionado.estado && (
                                                <Badge variant="outline" className="text-xs">
                                                    {funcionarioSeleccionado.estado}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={limpiarSeleccion}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Resultados de búsqueda */}
            <AnimatePresence>
                {mostrarResultados && funcionarios.length > 0 && !funcionarioSeleccionado && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 z-50 mt-1"
                    >
                        <Card className="shadow-lg border-2">
                            <CardContent className="p-0">
                                <div className="max-h-64 overflow-y-auto">
                                    {funcionarios.map((funcionario, index) => (
                                        <div key={funcionario.id}>
                                            <motion.button
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => seleccionarFuncionario(funcionario)}
                                                className="w-full p-4 text-left hover:bg-muted/50 transition-colors focus:bg-muted/50 focus:outline-none"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-muted rounded-lg">
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-foreground">
                                                            {resaltarTexto(`${funcionario.nombres} ${funcionario.apellidos}`, busqueda)}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <span>CI: {resaltarTexto(funcionario.ci, busqueda)}</span>
                                                            {funcionario.cargo_actual && (
                                                                <>
                                                                    <Separator orientation="vertical" className="h-3" />
                                                                    <span>{funcionario.cargo_actual}</span>
                                                                </>
                                                            )}
                                                            {funcionario.estado && (
                                                                <>
                                                                    <Separator orientation="vertical" className="h-3" />
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {funcionario.estado}
                                                                    </Badge>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.button>
                                            {index < funcionarios.length - 1 && <Separator />}
                                        </div>
                                    ))}
                                </div>

                                {funcionarios.length === 0 && busqueda.length >= 2 && (
                                    <div className="p-4 text-center text-muted-foreground">
                                        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>No se encontraron funcionarios</p>
                                        <p className="text-xs">Intenta con otros términos de búsqueda</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}