import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
<<<<<<< HEAD
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,jsx,css,html,png,svg,jpeg}'],
        clientsClaim: true,
        skipWaiting: true,
        // ✅ El bundle principal supera los 2 MiB por defecto; se sube el
        // límite para que el SW pueda precachearlo sin fallar el build.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
=======
      registerType: "autoUpdate",
      // includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{jsx,css,html,png,svg,jpeg}"],
        clientsClaim: true,
        skipWaiting: true,
>>>>>>> 7c7b3dc0cdf834107f8b89b87d729450a7581b38
      },
      manifest: {
        name: "Unistock",
        short_name: "Uni",
        description: "Unistock - Sistema de gestión de inventario",
        scope: "/",
        start_url: "/",
        display: "standalone",
        theme_color: "#FF4FD6",
        background_color: "#ffffff",
        screenshots: [
          {
            src: "/logouni.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "/Login.jpeg",
            sizes: "960x1280",
            type: "image/png",
            form_factor: "narrow",
          },
        ],
        icons: [
          {
            src: "/logouni.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  // server: {
  //   port: 3000,
  //   open: true
  // }
});
