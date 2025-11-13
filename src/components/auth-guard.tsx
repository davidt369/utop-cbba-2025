'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthCheck } from '@/hooks/auth.queries';

interface AuthGuardProps {
    children: ReactNode;
    requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthCheck();

    useEffect(() => {
        if (!isLoading && requireAuth && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, requireAuth, router]);

    // Mostrar loading mientras verifica autenticación
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Si requiere autenticación y no está autenticado, no mostrar contenido
    if (requireAuth && !isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}