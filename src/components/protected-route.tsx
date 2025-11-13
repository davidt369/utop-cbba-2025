'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: string;
    fallback?: ReactNode;
}

export function ProtectedRoute({
    children,
    requiredRole,
    fallback
}: ProtectedRouteProps) {
    const router = useRouter();
    const { isAuthenticated, user, _hasHydrated } = useAuthStore();

    useEffect(() => {
        // Solo verificar después de la hidratación
        if (_hasHydrated && !isAuthenticated()) {
            router.push('/login');
            return;
        }

        // Verificar rol si es requerido
        if (_hasHydrated && isAuthenticated() && requiredRole && user?.rol?.nombre_rol !== requiredRole) {
            router.push('/unauthorized');
            return;
        }
    }, [isAuthenticated, user, _hasHydrated, requiredRole, router]);

    // Mientras se hidrata o no está autenticado, mostrar fallback o loading
    if (!_hasHydrated || !isAuthenticated()) {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Si requiere un rol específico y no lo tiene
    if (requiredRole && user?.rol?.nombre_rol !== requiredRole) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
                    <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}