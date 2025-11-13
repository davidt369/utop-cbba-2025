"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TodosFuncionariosPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirigir a la página principal de funcionarios
    router.replace('/dashboard/funcionarios')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  )
}