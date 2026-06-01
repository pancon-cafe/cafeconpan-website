import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: { port: 5173, strictPort: true },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'Apple Brand Character.png'],
      manifest: {
        name: 'Cafe Con Pan',
        short_name: 'Cafe Con Pan',
        description: 'Apple technology services for small businesses.',
        theme_color: '#0D0702',
        background_color: '#0D0702',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/#quote-builder',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      selfDestroying: true,
    }),
  ],
})
