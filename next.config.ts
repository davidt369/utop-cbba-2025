import type { NextConfig } from "next";
import withPWA from "next-pwa";
// @ts-ignore: no types for next-pwa/cache
import runtimeCaching from "next-pwa/cache";
import { join } from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow HMR websocket connections from the remote devtunnel
  allowedDevOrigins: [
    "https://backend-laravel-utop-production.up.railway.app/api",
  ],

  webpack: (config, { isServer }) => {
    // Configuración para react-pdf con mejor compatibilidad para Next.js 15
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        canvas: false,
      };
    }

    return config;
  },

  // Configuración experimental para Next.js 15
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  // Rewrites para development: proxy simple a backend Laravel
  async rewrites() {
    return [
      // Proxy para endpoints de la API autenticada (usado por el frontend)
      {
        source: "/api/auth/:path*",
        destination:
          "https://backend-laravel-utop-production.up.railway.app/api/auth/:path*",
      },
      // Proxy para archivos servidos desde storage (cuando Storage::url() devuelve /storage/...)
      {
        source: "/storage/:path*",
        destination: "http://127.0.0.1:8000/storage/:path*",
      },
    ];
  },
};

const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  // Usar logo-utop.png como icono para PWA y favicons (usar PNG para evitar recortes o fallbacks)
  iconPaths: {
    favicon16: "/logo-utop-pwa.png",
    favicon32: "/logo-utop-pwa.png",
    appleTouchIcon: "/logo-utop-pwa.png",
    maskableIcon: "/logo-utop-pwa.png",
    msTileImage: "/logo-utop-pwa.png",
  },
  // FOR TESTING LOCAL: activar PWA también en development (temporal).
  // Nota: Next-PWA puede comportarse de forma diferente en dev; después de probar, revertir a `process.env.NODE_ENV !== 'production'`.
  disable: process.env.NODE_ENV !== "production",

  runtimeCaching,
};

export default withPWA(pwaConfig)(nextConfig as any);
