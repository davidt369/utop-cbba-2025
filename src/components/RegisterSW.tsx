"use client";

import { useEffect } from "react";

export default function RegisterSW() {
    useEffect(() => {
        if (typeof window === "undefined") return;
        // Permitir registro en development para localhost
        // if (process.env.NODE_ENV === "development") return;

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js').then(
                    function (registration) {
                        // Registration successful
                        console.log('SW registered: ', registration.scope);
                    },
                    function (err) {
                        console.log('SW registration failed: ', err);
                    }
                );
            });
        }
    }, []);

    return null;
}
