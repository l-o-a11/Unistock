import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{jsx,css,html,png,svg,jpeg}"],
        clientsClaim: true,
        skipWaiting: true,
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
