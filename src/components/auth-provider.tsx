'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuthCheck } from '@/hooks/auth.queries';
import { useAuthStore } from '@/store/auth.store';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [isClient, setIsClient] = useState(false);
    const hasHydrated = useAuthStore(state => state._hasHydrated);

    // Verificar autenticación automáticamente
    const { isLoading } = useAuthCheck();

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Mostrar loading mientras se hidrata el estado
    if (!isClient || !hasHydrated || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return <>{children}</>;
}