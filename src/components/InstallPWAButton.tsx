"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function InstallPWAButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Verificar si la app ya está instalada
        const checkIfInstalled = () => {
            // Para navegadores que soportan getInstalledRelatedApps
            if ('getInstalledRelatedApps' in navigator) {
                (navigator as any).getInstalledRelatedApps?.().then((apps: any[]) => {
                    if (apps.length > 0) {
                        setIsInstalled(true);
                        setIsVisible(false);
                    }
                });
            }

            // Verificar si se está ejecutando en modo standalone (ya instalada)
            if (window.matchMedia('(display-mode: standalone)').matches) {
                setIsInstalled(true);
                setIsVisible(false);
            }
        };

        const beforeInstallHandler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Solo mostrar si no está instalada
            if (!isInstalled) {
                setIsVisible(true);
            }
        };

        const appInstalledHandler = () => {
            console.log("PWA was installed");
            setIsInstalled(true);
            setIsVisible(false);
            setDeferredPrompt(null);
        };

        // Verificar estado inicial
        checkIfInstalled();

        // Event listeners
        window.addEventListener("beforeinstallprompt", beforeInstallHandler);
        window.addEventListener("appinstalled", appInstalledHandler);

        // Verificar periodicamente si está instalada (por si se desinstala)
        const interval = setInterval(checkIfInstalled, 30000);

        return () => {
            window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
            window.removeEventListener("appinstalled", appInstalledHandler);
            clearInterval(interval);
        };
    }, [isInstalled]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        try {
            deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;

            if (choiceResult.outcome === "accepted") {
                console.log("User accepted the A2HS prompt");
                setIsInstalled(true);
                setIsVisible(false);
            } else {
                console.log("User dismissed the A2HS prompt");
                // Ocultar por un tiempo si el usuario rechaza
                setTimeout(() => setIsVisible(false), 3000);
            }
        } catch (error) {
            console.error("Error during installation:", error);
        }

        setDeferredPrompt(null);
    };

    // Verificar si debemos mostrar basado en el tiempo de ocultamiento
    useEffect(() => {
        const hiddenUntil = localStorage.getItem('pwaPromptHiddenUntil');
        if (hiddenUntil) {
            const hideUntilDate = new Date(hiddenUntil);
            if (new Date() < hideUntilDate) {
                setIsVisible(false);
            }
        }
    }, []);

    if (!isVisible || isInstalled) return null;

    return (
        <Button
            onClick={handleInstallClick}
            className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-3000"
        >
            <Download className="h-4 w-4 mr-2" />
            Instalar U.T.O.P
        </Button>
    );
}