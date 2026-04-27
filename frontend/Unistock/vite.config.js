import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  plugins: [react(),
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['transparent-Photoroom.png', 'transparent-Photoroom_192x192.png', 'transparent-Photoroom_512x512.png', 'login.jpeg'],
    workbox: {
      navigateFallback: '/index.html',
      globPatterns: ['**/*.{js.jsx.css,html,png,svg,jpeg}']
    },
    manifest: {
      name: 'Unistock',
      short_name: 'Unistock',
      description: 'Sistema de gestión de inventario y control de producción para la empresa Unistock.',
      scope: '/',
      start_url: '/',
      display: 'standalone',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      screenshots: [
        {
          src: '/src/assets/transparent-Photoroom_1024x1024.png',
          sizes: '1024x1024',
          type: 'image/png',
          form_factor: 'narrow'
        },
        {
          src: '/src/assets/login_960x1280.jpeg',
          sizes: '960x1280',
          type: 'image/jpeg',
          form_factor: 'wide'
        }
      ],
      icons: [
        {
          src: '/src/assets/transparent-Photoroom_192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/src/assets/transparent-Photoroom_512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  })
  ],
});
