import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,jsx,css,html,png,svg,jpeg}']
      },
      manifest: {
        name: 'Aplicativo PWA ',
        short_name: 'MyApp',
        description: 'My Awesome App description',
        scope: "/",
        start_url: "/",
        display: "standalone",
        theme_color: '#ffffff',
        background_color: '#ffffff',
        screenshots: [{
          src: '/frontend/Unistock/src/assets/transparent-Photoroom.png/ pwa-192x192.png',
          sizes: '1200x581',
          type: 'image/png',
          form_factor: 'wide',
        },
        {
          src: '/frontend/Unistock/src/assets/Login.jpeg/ pwa-192x192.png',
          sizes: '512x512',
          type: 'image/png',
          form_factor: 'wide',
        }
        ],
        icons: [
          {
            src: '/frontend/Unistock/src/assets/Login.jpeg/ pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: '/frontend/Unistock/src/assets/transparent-Photoroom.png/ pwa-192x192.png',
            sizes: '1200x581',
            type: 'image/png',
            form_factor: 'wide',

          }
        ]
      }
    }),
  ],
  // server: {
  //   port: 3000,
  //   open: true
  // }
});