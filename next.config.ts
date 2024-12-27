import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: { unoptimized: true },
  typescript: {
    // !! ADVERTENCIA !!
    // Permitir que las construcciones de producción se completen
    // exitosamente incluso si hay errores de tipo.
    ignoreBuildErrors: true,
  },
  pwa: {
    dest: 'public', // La carpeta donde se almacenarán los archivos generados
    disable: process.env.NODE_ENV === 'development', // Deshabilita PWA en desarrollo
  },
  reactStrictMode: true,
};

export default nextConfig;

